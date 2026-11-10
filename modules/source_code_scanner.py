import json
import subprocess
import sys
import tempfile
import re
import zipfile
import io

from pathlib import Path, PurePosixPath


def scan_python_code(source_code):
    """
    Scan Python source code using Bandit.
    The source code is analyzed, never executed.
    """

    if not isinstance(source_code, str) or not source_code.strip():
        return {
            "status": "Error",
            "message": "Python source code is empty.",
            "findings": []
        }

    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            file_path = Path(temp_dir) / "uploaded_code.py"

            file_path.write_text(
                source_code,
                encoding="utf-8"
            )

            result = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "bandit",
                    "-f",
                    "json",
                    str(file_path)
                ],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode not in (0, 1):
                return {
                    "status": "Error",
                    "message": result.stderr or "Bandit scan failed.",
                    "findings": []
                }

            report = json.loads(result.stdout)

            findings = []

            for issue in report.get("results", []):

                findings.append({
                    "issue": issue.get("issue_text", "Unknown issue"),
                    "severity": issue.get("issue_severity", "LOW").title(),
                    "confidence": issue.get("issue_confidence", "LOW").title(),
                    "file": issue.get("filename", "Unknown"),
                    "line": issue.get("line_number", 0),
                    "test_id": issue.get("test_id", "Unknown")
                })

            return {
                "status": "Success",
                "total_issues": len(findings),
                "findings": findings
            }

    except subprocess.TimeoutExpired:
        return {
            "status": "Error",
            "message": "Source-code scan timed out.",
            "findings": []
        }

    except (OSError, json.JSONDecodeError) as error:
        return {
            "status": "Error",
            "message": str(error),
            "findings": []
        }


def scan_zip_file(zip_bytes):
    """
    Safely scan a ZIP archive containing website source code.
    Files are inspected but never executed.
    """

    MAX_ZIP_SIZE = 10 * 1024 * 1024
    MAX_FILES = 500
    MAX_EXTRACTED_SIZE = 30 * 1024 * 1024

    if not zip_bytes:
        return {
            "status": "Error",
            "message": "ZIP file is empty.",
            "findings": []
        }

    if len(zip_bytes) > MAX_ZIP_SIZE:
        return {
            "status": "Error",
            "message": "ZIP file exceeds the 10 MB limit.",
            "findings": []
        }

    findings = []
    scanned_files = 0
    extracted_size = 0

    allowed_extensions = {
        ".py", ".js", ".ts", ".jsx", ".tsx",
        ".html", ".css", ".php", ".java",
        ".cpp", ".c", ".cs", ".go", ".rb"
    }

    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:

            members = archive.infolist()

            if len(members) > MAX_FILES:
                raise ValueError("ZIP contains too many files.")

            for member in members:

                if member.is_dir():
                    continue

                # Validate ZIP paths
                zip_path = member.filename

                if "\\" in zip_path:
                    raise ValueError("ZIP contains an unsafe file path.")

                safe_path = PurePosixPath(zip_path)

                if (
                    safe_path.is_absolute()
                    or ".." in safe_path.parts
                    or (safe_path.parts and ":" in safe_path.parts[0])
                ):
                    raise ValueError("ZIP contains an unsafe file path.")

                if member.flag_bits & 0x1:
                    raise ValueError("Encrypted ZIP files are not supported.")

                if member.file_size > MAX_EXTRACTED_SIZE:
                    raise ValueError("A file inside ZIP is too large.")

                extracted_size += member.file_size

                if extracted_size > MAX_EXTRACTED_SIZE:
                    raise ValueError("ZIP extracted size exceeds 30 MB.")

                if safe_path.suffix.lower() not in allowed_extensions:
                    continue

                with archive.open(member) as source:
                    content = source.read(member.file_size + 1)

                if len(content) != member.file_size:
                    raise ValueError("ZIP file contains inconsistent file data.")

                try:
                    source_code = content.decode("utf-8")
                except UnicodeDecodeError:
                    findings.append({
                        "issue": "File is not valid UTF-8 text.",
                        "severity": "Low",
                        "file": zip_path,
                        "line": 0
                    })
                    continue

                #Skip emty source files
                if not source_code.strip():
                    continue

                scanned_files += 1

                # Run Bandit on Python files
                if safe_path.suffix.lower() == ".py":

                    result = scan_python_code(source_code)

                    if result["status"] == "Error":
                        raise ValueError(result["message"])

                    for issue in result["findings"]:
                        issue["file"] = zip_path
                        findings.append(issue)

                # Check non-Python source files for possible hardcoded secrets
                if safe_path.suffix.lower() != ".py":

                    secret_patterns = {
                        "Possible hardcoded API key": (
                            r"""(?i)(api[-]?key|secret[-]?key)"""
                            r"""\s*[:=]\s*['"][^'"\s]{8,}['"]"""
                        ),
                        "Possible hardcoded password": (
                            r"""(?i)(password|passwd|pwd)"""
                            r"""\s*[:=]\s*['"][^'"]{4,}['"]"""
                        )
                    }

                    for line_number, line in enumerate(
                        source_code.splitlines(),
                        start=1
                    ):

                        for description, pattern in secret_patterns.items():

                            if re.search(pattern, line):

                                findings.append({
                                    "issue": description,
                                    "severity": "High",
                                    "file": zip_path,
                                    "line": line_number
                                })

            return {
                "status": "Success",
                "scanned_files": scanned_files,
                "total_issues": len(findings),
                "findings": findings
            }
        

    except (
        zipfile.BadZipFile,
        ValueError,
        OSError,
        RuntimeError
    ) as error:

        return {
            "status": "Error",
            "message": str(error),
            "findings": []
        }