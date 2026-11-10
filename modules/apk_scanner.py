from androguard.core.apk import APK


MAX_APK_SIZE = 100 * 1024 * 1024  # 100 MB


def scan_apk_file(apk_bytes):
    """
    Perform static security analysis of an Android APK.
    The APK is never installed or executed.
    """

    if not apk_bytes:
        return {
            "status": "Error",
            "message": "APK file is empty.",
            "findings": []
        }

    if len(apk_bytes) > MAX_APK_SIZE:
        return {
            "status": "Error",
            "message": "APK exceeds the 100 MB size limit.",
            "findings": []
        }

    try:
        apk = APK(apk_bytes, raw=True)

        if not apk.is_valid_APK():
            return {
                "status": "Error",
                "message": "Invalid or corrupted APK file.",
                "findings": []
            }

        package_name = apk.get_package()
        app_name = apk.get_app_name()
        permissions = apk.get_permissions()

        activities = apk.get_activities()
        services = apk.get_services()
        receivers = apk.get_receivers()
        providers = apk.get_providers()

        findings = []

        # Permissions that may expose sensitive user data
        dangerous_permissions = {
            "android.permission.READ_SMS",
            "android.permission.SEND_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.READ_CONTACTS",
            "android.permission.WRITE_CONTACTS",
            "android.permission.RECORD_AUDIO",
            "android.permission.CAMERA",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.READ_CALL_LOG",
            "android.permission.WRITE_CALL_LOG",
            "android.permission.READ_PHONE_STATE"
        }

        for permission in permissions:

            if permission in dangerous_permissions:

                findings.append({
                    "issue": (
                        f"Sensitive permission requested: {permission}"
                    ),
                    "severity": "Medium",
                    "file": "AndroidManifest.xml",
                    "line": "N/A"
                })

        # Read important Android application settings
        security_attributes = {
            "debuggable": (
                "Application debugging is enabled.",
                "High"
            ),
            "allowBackup": (
                "Application backup is enabled.",
                "Medium"
            ),
            "usesCleartextTraffic": (
                "Application permits unencrypted network traffic.",
                "Medium"
            )
        }

        for attribute, details in security_attributes.items():

            description, severity = details

            try:
                value = apk.get_attribute_value(
                    "application",
                    attribute,
                    format_value=True
                )

                if str(value).lower() == "true":

                    findings.append({
                        "issue": description,
                        "severity": severity,
                        "file": "AndroidManifest.xml",
                        "line": "N/A"
                    })

            except Exception:
                pass

        return {
            "status": "Success",
            "app_name": app_name,
            "package_name": package_name,
            "total_permissions": len(permissions),
            "permissions": permissions,
            "activities": activities,
            "services": services,
            "receivers": receivers,
            "providers": providers,
            "total_issues": len(findings),
            "findings": findings
        }

    except Exception:
        return {
            "status": "Error",
            "message": "Unable to analyze this APK file.",
            "findings": []
        }