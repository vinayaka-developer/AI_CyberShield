import streamlit as st

from gemini_client import ask_gemini
from modules.website_scanner import analyze_url
from modules.website_vulnerability_scanner import scan_website
from modules.source_code_scanner import scan_python_code, scan_zip_file
from modules.github_scanner import scan_github_repository
from modules.apk_scanner import scan_apk_file
from utils.risk_analyzer import calculate_risk
from utils.report_generator import (
    create_security_report,
    create_github_security_report
)



# Page configuration
st.set_page_config(
    page_title="AI CyberShield",
    page_icon="🛡️",
    layout="centered"
)


# App title
st.title("🛡️ AI CyberShield")
st.subheader("Your AI-Powered Cybersecurity Assistant")

st.write(
    "Your assistant for website security, phishing detection, "
    "malware awareness, and online safety."
)


# Navigation
page = st.sidebar.radio(
    "Choose a feature",
    [
        "AI Chatbot",
        "Website Scanner",
        "Website Vulnerability Scanner",
        "Source Code Scanner",
        "GitHub Repository Scanner",
        "Android APK Scanner"
    ]
)


# AI Chatbot
if page == "AI Chatbot":

    st.header("🤖 AI Cybersecurity Assistant")

    question = st.text_area(
        "Enter your cybersecurity question:"
    )

    if st.button("Ask CyberShield"):

        if question.strip():

            with st.spinner("Thinking..."):

                try:
                    answer = ask_gemini(question)

                    st.success("Response")
                    st.write(answer)

                except Exception as e:
                    st.error(f"Something went wrong: {e}")

        else:
            st.warning("Please enter a question.")


# Website URL Scanner
elif page == "Website Scanner":

    st.header("🌐 Website Security Scanner")

    url = st.text_input(
        "Enter website URL:",
        placeholder="https://example.com",
        key="url_scanner_input"
    )

    if st.button("Scan Website", key="scan_url_button"):

        if url.strip():

            with st.spinner("Analyzing website URL..."):

                try:
                    result = analyze_url(url)

                    st.session_state["url_scan_result"] = result
                    st.session_state["url_scanned_url"] = url

                except Exception as e:
                    st.error(f"Scan failed: {e}")

        else:
            st.warning("Please enter a website URL.")

    result = st.session_state.get("url_scan_result")

    if result:

        if result["risk_level"] == "Invalid":

            st.error(result["findings"][0])

        else:

            st.subheader("URL Scan Results")

            st.metric(
                "URL Risk Score",
                f'{result["risk_score"]}/100'
            )

            st.write(f'*Risk Level:* {result["risk_level"]}')

            st.write("*Security Findings:*")

            for finding in result["findings"]:
                st.write(f"• {finding}")

            st.caption(
                "This is a heuristic check, not a guarantee "
                "that a website is safe."
            )

            pdf_report = create_security_report(
                st.session_state["url_scanned_url"],
                result
            )

            st.download_button(
                label="📄 Download Security Report (PDF)",
                data=pdf_report,
                file_name="AI_CyberShield_URL_Report.pdf",
                mime="application/pdf"
            )


# Website Vulnerability Scanner
elif page == "Website Vulnerability Scanner":

    st.header("🔍 Website Vulnerability Scanner")

    st.warning(
        "Only scan websites that you own or have permission to assess."
    )

    website = st.text_input(
        "Enter website URL:",
        placeholder="https://example.com",
        key="vulnerability_scanner_input"
    )

    if st.button(
        "Scan Website Vulnerabilities",
        key="vulnerability_scan_button"
    ):

        if website.strip():

            with st.spinner("Checking website security..."):

                result = scan_website(website)

                st.session_state["vulnerability_result"] = result
                st.session_state["vulnerability_scanned_url"] = website

        else:
            st.warning("Please enter a website URL.")

    result = st.session_state.get("vulnerability_result")

    if result:

        if result["status"] == "Error":

            st.error(result["message"])

        else:

            st.subheader("Vulnerability Scan Results")

            st.write(f'*Website:* {result["website"]}')

            st.write(
                f'*HTTP Status:* {result["http_status"]}'
            )

            st.metric(
                "Vulnerability Risk Score",
                f'{result["risk_score"]}/100'
            )

            st.write(
                f'*Risk Level:* {result["risk_level"]}'
            )

            st.write("### Security Findings")

            if result["findings"]:

                for index, finding in enumerate(
                    result["findings"],
                    start=1
                ):

                    with st.expander(
                        f'{index}. {finding["issue"]} '
                        f'({finding["severity"]})'
                    ):

                        st.write(
                            "*Recommended Fix:*"
                        )

                        st.write(finding["recommendation"])

            else:

                st.success(
                    "No issues were detected by these basic checks."
                )

            st.caption(
                "This is a basic security-header audit, not a complete "
                "vulnerability assessment or guarantee of website safety."
            )
            # Generate vulnerability security report
            vulnerability_pdf = create_security_report(
                st.session_state["vulnerability_scanned_url"],
                result
            )

            st.download_button(
                label="📄 Download Vulnerability Report (PDF)",
                data=vulnerability_pdf,
                file_name="AI_CyberShield_Vulnerability_Report.pdf",
                mime="application/pdf",
                key="download_vulnerability_report"
            )
# Source Code Scanner
elif page == "Source Code Scanner":

    st.header("💻 Source Code Security Scanner")

    st.write(
        "Scan Python code or upload a ZIP file "
        "containing website source code."
    )

    scan_type = st.radio(
        "Choose scanning method:",
        ["Python Code", "ZIP Upload"]
    )

    if scan_type == "Python Code":

        source_code = st.text_area(
            "Paste Python source code:",
            height=250
        )

        if st.button("Scan Python Code"):

            with st.spinner("Analyzing Python code..."):
                result = scan_python_code(source_code)

            st.session_state["source_scan_result"] = result
            st.session_state["source_scan_name"] = "Python Code"

    else:

        uploaded_file = st.file_uploader(
            "Upload website source-code ZIP:",
            type=["zip"],
            max_upload_size=10
        )

        if st.button("Scan ZIP File"):

            if uploaded_file is None:
                st.warning("Please upload a ZIP file.")

            else:
                with st.spinner("Scanning ZIP contents..."):
                    result = scan_zip_file(
                        uploaded_file.getvalue()
                    )

                st.session_state["source_scan_result"] = result
                st.session_state["source_scan_name"] = uploaded_file.name

    result = st.session_state.get("source_scan_result")

    if result:

        if result["status"] == "Error":

            st.error(result["message"])

        else:

            st.subheader("Source Code Scan Results")

            st.metric(
                "Security Findings",
                result["total_issues"]
            )

            if "scanned_files" in result:
                st.metric(
                    "Files Scanned",
                    result["scanned_files"]
                )

            risk_findings = [
                {
                    "severity": finding.get("severity", "Low"),
                    "description": finding.get("issue", "")
                }
                for finding in result["findings"]
            ]

            risk_result = calculate_risk(risk_findings)

            st.metric(
                "Heuristic Risk Score",
                f'{risk_result["risk_score"]}/100'
            )

            st.write(
                f'*Risk Level:* {risk_result["risk_level"]}'
            )

            if result["findings"]:

                for index, finding in enumerate(
                    result["findings"], start=1
                ):

                    with st.expander(
                        f'{index}. {finding["issue"]} '
                        f'({finding["severity"]})'
                    ):

                        st.write(
                            f'*File:* {finding.get("file", "Pasted code")}'
                        )

                        st.write(
                            f'*Line:* {finding.get("line", "Unknown")}'
                        )

                        if "confidence" in finding:
                            st.write(
                                f'*Confidence:* {finding["confidence"]}'
                            )

            else:
                st.success(
                    "No issues detected by the supported checks."
                )

            st.caption(
                "Static analysis may miss vulnerabilities "
                "or produce false positives."
            )

            report_result = {
                **result,
                "risk_score": risk_result["risk_score"],
                "risk_level": risk_result["risk_level"]
            }

            pdf_report = create_security_report(
                st.session_state["source_scan_name"],
                report_result
            )

            st.download_button(
                "📄 Download Source Code Report (PDF)",
                data=pdf_report,
                file_name="AI_CyberShield_Source_Code_Report.pdf",
                mime="application/pdf",
                key="download_source_report"
            )
# GitHub Repository Scanner
elif page == "GitHub Repository Scanner":

    st.header("🐙 GitHub Repository Security Scanner")

    st.warning(
        "Only scan public repositories that you own "
        "or have permission to assess."
    )

    repo_url = st.text_input(
        "Enter GitHub repository URL:",
        placeholder="https://github.com/owner/repository",
        key="github_repo_input"
    )

    if st.button("Scan GitHub Repository"):

        if repo_url.strip():

            with st.spinner("Downloading and scanning repository..."):

                result = scan_github_repository(repo_url)

                st.session_state["github_scan_result"] = result
                st.session_state["github_scanned_url"] = repo_url

        else:
            st.warning("Please enter a GitHub repository URL.")

    result = st.session_state.get("github_scan_result")

    if result:

        if result["status"] == "Error":

            st.error(result["message"])

        else:

            st.subheader("GitHub Scan Results")

            st.metric(
                "Security Findings",
                result.get("total_issues", len(result["findings"]))
            )

            # Severity breakdown
            high_count = sum(
                1 for finding in result["findings"]
                if finding.get("severity", "").lower() == "high"
            )

            medium_count = sum(
                1 for finding in result["findings"]
                if finding.get("severity", "").lower() == "medium"
            )

            low_count = sum(
                1 for finding in result["findings"]
                if finding.get("severity", "").lower() == "low"
            )

            st.subheader("Severity Breakdown")

            col1, col2, col3 = st.columns(3)

            col1.metric("High", high_count)
            col2.metric("Medium", medium_count)
            col3.metric("Low", low_count)

            if "scanned_files" in result:
                st.metric(
                    "Files Scanned",
                    result["scanned_files"]
                )

            if result["findings"]:

                production_findings = []
                test_findings = []

                for finding in result["findings"]:

                    file_name = finding.get("file", "").lower()

                    if (
                        "/tests/" in file_name
                        or file_name.startswith("tests/")
                        or "/test_" in file_name
                        or file_name.startswith("test_")
                        or "/_tests_/" in file_name
                        or file_name.startswith("_tests_/")
                    ):
                        test_findings.append(finding)

                    else:
                        production_findings.append(finding)

                st.subheader("Production Code Findings")

                st.metric(
                    "Production Findings",
                    len(production_findings)
                )

                for index, finding in enumerate(
                    production_findings, start=1
                ):

                    with st.expander(
                        f'{index}. {finding.get("issue", "Security issue")} '
                        f'({finding.get("severity", "Unknown")})'
                    ):

                        st.write(
                            f'File: {finding.get("file", "Unknown")}'
                        )

                        st.write(
                            f'Line: {finding.get("line", "Unknown")}'
                        )

                st.subheader("Test Code Findings")

                st.metric(
                    "Test Findings",
                    len(test_findings)
                )

                for index, finding in enumerate(
                    test_findings, start=1
                ):

                    with st.expander(
                        f'{index}. {finding.get("issue", "Security issue")} '
                        f'({finding.get("severity", "Unknown")})'
                    ):

                        st.write(
                            f'File: {finding.get("file", "Unknown")}'
                        )

                        st.write(
                            f'Line: {finding.get("line", "Unknown")}'
                        )

            else:

                st.success(
                    "No issues detected by the supported checks."
                )

            st.caption(
                "Findings are classified by file path. "
                "Static analysis may produce false positives and "
                "does not guarantee repository security."
            )
            github_pdf = create_github_security_report(
                result["repository"],
                result,
                production_findings,
                test_findings
            )

            st.download_button(
                label="📄 Download GitHub Security Report (PDF)",
                data=github_pdf,
                file_name="AI_CyberShield_GitHub_Report.pdf",
                mime="application/pdf",
                key="download_github_report"
            )
# Android APK Scanner
elif page == "Android APK Scanner":

    st.header("📱 Android APK Security Scanner")

    st.warning(
        "Upload APK files only from trusted sources. "
        "The scanner analyzes the file without installing or executing it."
    )

    uploaded_apk = st.file_uploader(
        "Upload Android APK file:",
        type=["apk"],
        key="apk_upload"
    )

    if st.button("Scan APK", key="scan_apk_button"):

        if uploaded_apk is None:
            st.warning("Please upload an APK file.")

        else:
            with st.spinner("Analyzing APK permissions..."):

                result = scan_apk_file(
                    uploaded_apk.getvalue()
                )

                st.session_state["apk_scan_result"] = result

    result = st.session_state.get("apk_scan_result")

    if result:

        if result["status"] == "Error":

            st.error(result["message"])

        else:

            st.subheader("APK Scan Results")

            st.write(f'*App Name:* {result["app_name"]}')
            st.write(f'*Package Name:* {result["package_name"]}')

            st.metric(
                "Total Permissions",
                result["total_permissions"]
            )

            st.metric(
                "Security Findings",
                result["total_issues"]
            )

            st.subheader("Requested Permissions")

            for permission in result["permissions"]:
                st.write(f"• {permission}")

            st.subheader("Security Findings")

            if result["findings"]:

                for finding in result["findings"]:

                    st.warning(
                        f'{finding["issue"]} '
                        f'({finding["severity"]})'
                    )

            else:
                st.success(
                    "No sensitive permissions were detected "
                    "by the current checks."
                )

            st.caption(
                "Permission analysis alone cannot determine whether "
                "an Android application is malicious."
            )