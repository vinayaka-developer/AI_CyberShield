import re
import requests

from modules.source_code_scanner import scan_zip_file


def scan_github_repository(repo_url):
    """
    Download and statically scan a public GitHub repository.
    Repository files are never executed.
    """

    match = re.fullmatch(
        r"https?://github\.com/([^/]+)/([^/#?]+)/?",
        repo_url.strip()
    )

    if not match:
        return {
            "status": "Error",
            "message": "Invalid GitHub repository URL.",
            "findings": []
        }

    owner, repo = match.groups()

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "AI-CyberShield"
    }

    try:
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=headers,
            timeout=15
        )

        if response.status_code == 404:
            raise ValueError("Repository not found or is not public.")

        response.raise_for_status()

        repository = response.json()
        branch = repository.get("default_branch")

        if not branch:
            raise ValueError("Could not identify the default branch.")

        zip_url = (
            f"https://codeload.github.com/"
            f"{owner}/{repo}/zip/refs/heads/{branch}"
        )

        zip_response = requests.get(
            zip_url,
            headers={"User-Agent": "AI-CyberShield"},
            timeout=30
        )

        zip_response.raise_for_status()

        zip_bytes = zip_response.content

        if not zip_bytes:
            raise ValueError("GitHub returned an empty ZIP archive.")

        if not zip_bytes.startswith(b"PK"):
            raise ValueError(
                "GitHub did not return a valid ZIP archive."
            )

        result = scan_zip_file(zip_bytes)

        if result["status"] == "Error":
            return result

        return {
            "status": "Success",
            "repository": f"{owner}/{repo}",
            "branch": branch,
            "scanned_files": result.get("scanned_files", 0),
            "total_issues": result.get("total_issues", 0),
            "findings": result.get("findings", [])
        }

    except (requests.RequestException, ValueError) as error:
        return {
            "status": "Error",
            "message": str(error),
            "findings": []
        }