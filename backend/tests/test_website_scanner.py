from modules.website_scanner import analyze_url


def test_https_website():
    result = analyze_url("https://google.com")
    assert result["risk_level"] == "Low"


def test_http_website():
    result = analyze_url("http://example.com")
    assert result["risk_score"] >= 15


def test_ip_address():
    result = analyze_url("http://192.168.1.1")
    assert result["risk_score"] >= 40


def test_empty_url():
    result = analyze_url("")
    assert result["risk_level"] == "Invalid"


def test_suspicious_keywords():
    result = analyze_url("http://login-verify-account.xyz")
    assert result["risk_score"] >= 30