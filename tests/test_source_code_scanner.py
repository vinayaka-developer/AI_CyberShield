import io
import zipfile

from modules.source_code_scanner import (
    scan_python_code,
    scan_zip_file
)


def create_test_zip(files):
    """Create an in-memory ZIP file for testing."""

    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w") as archive:

        for filename, content in files.items():
            archive.writestr(filename, content)

    return buffer.getvalue()


# Python scanner tests

def test_empty_source_code():
    result = scan_python_code("")

    assert result["status"] == "Error"
    assert result["findings"] == []


def test_detects_unsafe_eval():
    source_code = """
user_input = input("Enter expression: ")
result = eval(user_input)
print(result)
"""

    result = scan_python_code(source_code)

    assert result["status"] == "Success"
    assert result["total_issues"] >= 1

    detected = any(
        "eval" in finding["issue"].lower()
        for finding in result["findings"]
    )

    assert detected


def test_safe_python_code():
    source_code = """
name = "CyberShield"
print("Welcome", name)
"""

    result = scan_python_code(source_code)

    assert result["status"] == "Success"
    assert result["total_issues"] == 0


# ZIP scanner tests

def test_scan_safe_zip():

    zip_bytes = create_test_zip({
        "website/app.py": 'name = "CyberShield"\nprint(name)'
    })

    result = scan_zip_file(zip_bytes)

    assert result["status"] == "Success"
    assert result["scanned_files"] == 1
    assert result["total_issues"] == 0


def test_detect_hardcoded_password_in_zip():

    zip_bytes = create_test_zip({
        "website/config.js": 'password = "mysecretpassword123"'
    })

    result = scan_zip_file(zip_bytes)

    assert result["status"] == "Success"
    assert result["total_issues"] >= 1

    assert any(
        "password" in finding["issue"].lower()
        for finding in result["findings"]
    )


def test_reject_unsafe_zip_path():

    zip_bytes = create_test_zip({
        "../outside.py": 'print("unsafe path")'
    })

    result = scan_zip_file(zip_bytes)

    assert result["status"] == "Error"
    assert "unsafe file path" in result["message"].lower()


def test_invalid_zip_file():

    result = scan_zip_file(b"not a zip file")

    assert result["status"] == "Error"