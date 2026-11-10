from modules.apk_scanner import scan_apk_file


def test_empty_apk():
    result = scan_apk_file(b"")

    assert result["status"] == "Error"
    assert result["findings"] == []


def test_invalid_apk():
    result = scan_apk_file(b"not a real APK")

    assert result["status"] == "Error"
    assert result["findings"] == []