from urllib.parse import urlparse
import ipaddress
import re

from utils.risk_analyzer import calculate_risk


def analyze_url(url):
    """
    Analyse a URL for common phishing indicators.
    Uses the shared risk analyzer to calculate the score.
    """

    if not isinstance(url, str) or not url.strip():
        return {
            "risk_score": 0,
            "risk_level": "Invalid",
            "findings": ["Please enter a valid URL."]
        }

    url = url.strip()

    if "://" not in url:
        url = "https://" + url

    try:
        parsed = urlparse(url)
        hostname = parsed.hostname

        if (
            parsed.scheme not in ("http", "https")
            or not hostname
            or "." not in hostname
            or not re.fullmatch(r"[A-Za-z0-9.-]+", hostname)
            or any(
                not label
                or len(label) > 63
                or label.startswith("-")
                or label.endswith("-")
                for label in hostname.split(".")
            )
        ):
            raise ValueError("Invalid URL")

    except ValueError:
        return {
            "risk_score": 0,
            "risk_level": "Invalid",
            "findings": ["The URL format is invalid."]
        }
    findings = []
    risk_findings = []

    def add_finding(description, points, severity):
        findings.append(description)

        risk_findings.append({
            "severity": severity,
            "description": description,
            "points": points
        })

    # Check HTTPS
    if parsed.scheme != "https":
        add_finding(
            "Website does not use HTTPS.",
            15,
            "medium"
        )

    # Check IP address
    try:
        ipaddress.ip_address(hostname)
        add_finding(
            "Website uses an IP address instead of a domain.",
            25,
            "high"
        )
    except ValueError:
        pass

    # Check suspicious keywords
    suspicious_words = [
        "login", "verify", "account", "password",
        "banking", "secure", "update", "free",
        "gift", "wallet"
    ]

    url_lower = url.lower()

    for word in suspicious_words:
        if word in url_lower:
            add_finding(
                f"Suspicious keyword detected: {word}",
                5,
                "low"
            )

    # Check unusual domain extensions
    suspicious_tlds = [
        ".xyz", ".top", ".click", ".work",
        ".zip", ".mov", ".gq", ".tk"
    ]

    if any(hostname.lower().endswith(tld)
           for tld in suspicious_tlds):
        add_finding(
            "Domain uses an extension sometimes abused by scammers.",
            15,
            "medium"
        )

    # Check punycode
    if "xn--" in hostname.lower():
        add_finding(
            "Domain contains punycode characters.",
            20,
            "medium"
        )

    # Check URL shorteners
    shorteners = [
        "bit.ly", "tinyurl.com", "t.co",
        "is.gd", "cutt.ly"
    ]

    if hostname.lower() in shorteners:
        add_finding(
            "URL uses a link-shortening service.",
            20,
            "medium"
        )

    # Check username or password in URL
    if parsed.username or parsed.password:
        add_finding(
            "URL contains embedded login credentials.",
            25,
            "high"
        )

    # Check excessive subdomains
    if len(hostname.split(".")) > 4:
        add_finding(
            "URL contains an unusually large number of subdomains.",
            10,
            "low"
        )

    if not findings:
        findings.append(
            "No obvious suspicious URL patterns detected."
        )

    # Use the shared risk analyzer
    risk_result = calculate_risk(risk_findings)

    return {
        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],
        "findings": findings,
        "evidence": risk_result["evidence"],
        "domain": hostname,
        "scheme": parsed.scheme
    }