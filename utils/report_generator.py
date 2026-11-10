from io import BytesIO
from datetime import datetime
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)


def create_security_report(url, scan_result):

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        textColor=colors.HexColor("#123B66"),
        fontSize=22,
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#123B66"),
        spaceBefore=15,
        spaceAfter=8
    )

    normal_style = styles["BodyText"]

    story = []

    # Report title
    story.append(
        Paragraph("AI CyberShield - Security Report", title_style)
    )

    story.append(HRFlowable(width="100%", color=colors.blue))
    story.append(Spacer(1, 15))

    # Website information
    story.append(
        Paragraph("Website Information", heading_style)
    )

    story.append(
        Paragraph(
            f"<b>Website:</b> {escape(str(url))}",
            normal_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Report Date:</b> "
            f"{datetime.now().strftime('%d-%m-%Y %H:%M')}",
            normal_style
        )
    )

    if "http_status" in scan_result:
        story.append(
            Paragraph(
                f"<b>HTTP Status:</b> "
                f"{escape(str(scan_result['http_status']))}",
                normal_style
            )
        )

    story.append(Spacer(1, 15))

    # Security overview
    story.append(
        Paragraph("Security Overview", heading_style)
    )

    risk_score = scan_result.get("risk_score", 0)
    risk_level = scan_result.get("risk_level", "Unknown")
    status = scan_result.get("status", "Completed")

    data = [
        ["Risk Score", f"{risk_score}/100"],
        ["Risk Level", str(risk_level)],
        ["Scan Status", str(status)]
    ]

    table = Table(data, colWidths=[2 * inch, 3 * inch])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    ]))

    story.append(table)

    # Security findings
    story.append(
        Paragraph("Security Findings", heading_style)
    )

    findings = scan_result.get("findings", [])

    if findings:

        for index, finding in enumerate(findings, start=1):

            if isinstance(finding, dict):

                description = finding.get(
                    "description",
                    finding.get("issue", "Unknown finding")
                )

                severity = finding.get("severity", "Unknown")

            else:
                description = str(finding)
                severity = "Not specified"

            story.append(
                Paragraph(
                    f"<b>{index}. </b>{escape(str(description))}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Severity:</b> {escape(str(severity))}",
                    normal_style
                )
            )

            story.append(Spacer(1, 8))

    else:

        story.append(
            Paragraph(
                "No security findings were reported by these checks.",
                normal_style
            )
        )

    # Recommended actions
    story.append(
        Paragraph("Recommended Actions", heading_style)
    )

    added_recommendations = set()

    for finding in findings:

        if isinstance(finding, dict):

            recommendation = finding.get("recommendation")

            description = finding.get(
                "description",
                finding.get("issue", "")
            )

            if recommendation:

                if recommendation not in added_recommendations:

                    story.append(
                        Paragraph(
                            f"• {escape(str(recommendation))}",
                            normal_style
                        )
                    )

                    added_recommendations.add(recommendation)

            elif description:

                story.append(
                    Paragraph(
                        "• Investigate this finding: "
                        + escape(str(description)),
                        normal_style
                    )
                )

        else:

            description = str(finding)

            recommendations = {
                "https": "Use HTTPS and configure a valid TLS certificate.",
                "content-security-policy": "Configure a Content-Security-Policy header.",
                "strict-transport-security": "Configure the Strict-Transport-Security header.",
                "x-content-type-options": "Set X-Content-Type-Options to nosniff.",
                "x-frame-options": "Configure X-Frame-Options to prevent clickjacking.",
                "referrer-policy": "Configure an appropriate Referrer-Policy."
            }

            matched = False

            for keyword, recommendation in recommendations.items():

                if keyword in description.lower():

                    if recommendation not in added_recommendations:

                        story.append(
                            Paragraph(
                                f"• {escape(recommendation)}",
                                normal_style
                            )
                        )

                        added_recommendations.add(recommendation)

                    matched = True

            if not matched and "no obvious suspicious" not in description.lower():

                story.append(
                    Paragraph(
                        "• Investigate this finding: "
                        + escape(description),
                        normal_style
                    )
                )

    if not added_recommendations and not findings:

        story.append(
            Paragraph(
                "Continue monitoring the website and keep its security settings updated.",
                normal_style
            )
        )

    # Disclaimer
    story.append(Spacer(1, 25))
    story.append(HRFlowable(width="100%", color=colors.grey))
    story.append(Spacer(1, 8))

    story.append(
        Paragraph(
            "Generated by AI CyberShield. This report contains automated "
            "security observations. The vulnerability scanner performs "
            "basic security-header checks and does not guarantee that "
            "the website is completely secure.",
            styles["Italic"]
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer.getvalue()
def create_github_security_report(
    repository,
    scan_result,
    production_findings,
    test_findings
):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "GitHubReportTitle",
        parent=styles["Title"],
        textColor=colors.HexColor("#123B66"),
        fontSize=22,
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "GitHubReportHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#123B66"),
        spaceBefore=15,
        spaceAfter=8
    )

    normal_style = styles["BodyText"]
    story = []

    # Report title
    story.append(
        Paragraph("AI CyberShield - GitHub Security Report", title_style)
    )

    story.append(HRFlowable(width="100%", color=colors.blue))
    story.append(Spacer(1, 15))

    # Repository information
    story.append(
        Paragraph("Repository Information", heading_style)
    )

    story.append(
        Paragraph(
            f"<b>Repository:</b> {escape(str(repository))}",
            normal_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Report Date:</b> "
            f"{datetime.now().strftime('%d-%m-%Y %H:%M')}",
            normal_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Files Scanned:</b> "
            f"{scan_result.get('scanned_files', 0)}",
            normal_style
        )
    )

    story.append(Spacer(1, 15))

    # Security overview
    story.append(
        Paragraph("Security Overview", heading_style)
    )

    findings = scan_result.get("findings", [])

    high_count = sum(
        1 for f in findings
        if f.get("severity", "").lower() == "high"
    )

    medium_count = sum(
        1 for f in findings
        if f.get("severity", "").lower() == "medium"
    )

    low_count = sum(
        1 for f in findings
        if f.get("severity", "").lower() == "low"
    )

    overview_data = [
        ["Metric", "Result"],
        ["Total Findings", str(len(findings))],
        ["High Severity", str(high_count)],
        ["Medium Severity", str(medium_count)],
        ["Low Severity", str(low_count)],
        ["Production Findings", str(len(production_findings))],
        ["Test Findings", str(len(test_findings))]
    ]

    table = Table(
        overview_data,
        colWidths=[2.5 * inch, 2.5 * inch]
    )

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    ]))

    story.append(table)

    # Helper to add findings
    def add_findings_section(title, section_findings):

        story.append(
            Paragraph(title, heading_style)
        )

        if not section_findings:
            story.append(
                Paragraph("No findings in this section.", normal_style)
            )
            return

        for index, finding in enumerate(section_findings, start=1):

            issue = finding.get("issue", "Unknown security issue")
            severity = finding.get("severity", "Unknown")
            file_name = finding.get("file", "Unknown")
            line = finding.get("line", "Unknown")

            story.append(
                Paragraph(
                    f"<b>{index}. {escape(str(issue))}</b>",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Severity:</b> {escape(str(severity))}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>File:</b> {escape(str(file_name))}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Line:</b> {escape(str(line))}",
                    normal_style
                )
            )

            story.append(Spacer(1, 8))

    # Separate production and test findings
    add_findings_section(
        "Production Code Findings",
        production_findings
    )

    add_findings_section(
        "Test Code Findings",
        test_findings
    )

    # Disclaimer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", color=colors.grey))
    story.append(Spacer(1, 8))

    story.append(
        Paragraph(
            "Generated by AI CyberShield. This report contains "
            "automated static-analysis observations. Findings may "
            "include false positives or missed issues. A clean report "
            "does not guarantee that the repository is secure.",
            styles["Italic"]
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer.getvalue()
