from modules.github_scanner import scan_github_repository


def test_invalid_github_url():
    result = scan_github_repository("https://example.com")

    assert result["status"] == "Error"
    assert result["findings"] == []


def test_invalid_empty_url():
    result = scan_github_repository("")

    assert result["status"] == "Error"


def test_github_url_format():
    result = scan_github_repository(
        "https://github.com/invalid-owner/invalid-repo"
    )

    assert result["status"] in ("Error", "Success")