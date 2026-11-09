from utils.risk_analyzer import calculate_risk


def test_low_risk():
    findings = [
        {"severity": "low", "description": "Minor warning"}
    ]

    result = calculate_risk(findings)

    assert result["risk_score"] == 5
    assert result["risk_level"] == "Low"


def test_medium_risk():
    findings = [
        {"severity": "high", "description": "Suspicious domain"},
    ]

    result = calculate_risk(findings)

    assert result["risk_score"] == 30
    assert result["risk_level"] == "Medium"


def test_high_risk():
    findings = [
        {"severity": "high", "description": "Malicious indicator"},
        {"severity": "high", "description": "Dangerous redirect"}
    ]

    result = calculate_risk(findings)

    assert result["risk_score"] == 60
    assert result["risk_level"] == "High"


def test_empty_findings():
    result = calculate_risk([])

    assert result["risk_score"] == 0
    assert result["risk_level"] == "Low"


def test_score_never_exceeds_100():
    findings = [
        {"severity": "high", "description": f"Finding {i}"}
        for i in range(10)
    ]

    result = calculate_risk(findings)

    assert result["risk_score"] == 100