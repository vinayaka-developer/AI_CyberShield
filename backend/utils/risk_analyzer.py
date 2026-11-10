def calculate_risk(findings):
    """
    Calculate a risk score from security findings.

    Each finding can contain:
    - severity: low, medium, or high
    - description: explanation
    - points: optional custom score
    """

    weights = {
        "low": 5,
        "medium": 15,
        "high": 30
    }

    score = 0
    evidence = []

    for finding in findings:
        severity = str(
            finding.get("severity", "low")
        ).lower()

        description = finding.get(
            "description", "Unknown finding"
        )

        points = finding.get(
            "points", weights.get(severity, 0)
        )

        if not isinstance(points, int) or points < 0:
            points = 0

        score += points

        evidence.append({
            "severity": severity,
            "description": description,
            "points": points
        })

    score = min(score, 100)

    if score >= 60:
        level = "High"
    elif score >= 30:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_score": score,
        "risk_level": level,
        "evidence": evidence
    }