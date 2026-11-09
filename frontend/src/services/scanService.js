
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Website URL security scan
export async function scanUrl(url) {
  const response = await fetch(`${API_BASE_URL}/api/scan/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `Website scan failed: ${response.status}`
    );
  }

  return data;
}

// Website vulnerability scan
export async function scanWebsiteVulnerabilities(url) {
  const response = await fetch(
    `${API_BASE_URL}/api/scan/website-vulnerabilities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `Vulnerability scan failed: ${response.status}`
    );
  }

  return data;
}

// Direct Python source-code scan
export async function scanSourceCode(sourceCode) {
  const response = await fetch(
    `${API_BASE_URL}/api/scan/source-code`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        source_code: sourceCode,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `Source code scan failed: ${response.status}`
    );
  }

  return data;
}

// ZIP source-code scan
export async function scanSourceCodeZip(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/scan/source-code-zip`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || `ZIP scan failed: ${response.status}`
    );
  }

  return data;
}

// Generate and download PDF security report
export async function generatePDFReport(url, scanResult) {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/pdf`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
      body: JSON.stringify({
        target: url,
        scan_result: scanResult,
      }),
    }
  );

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();

      const detail = data.detail;

      const errorMessage =
        typeof detail === "string"
          ? detail
          : detail
            ? JSON.stringify(detail)
            : data.message || `PDF generation failed: ${response.status}`;

      throw new Error(errorMessage);
    }

    throw new Error(`PDF generation failed: ${response.status}`);
  }

  const pdfBlob = await response.blob();

  if (pdfBlob.type && !pdfBlob.type.includes("application/pdf")) {
    throw new Error("The backend did not return a PDF file.");
  }

  return pdfBlob;
}


// Store real completed scan results for the Reports page in this browser tab.
// sessionStorage keeps reports available while navigating without sending scan data to the backend.
const REPORTS_STORAGE_KEY = "ai_cybershield_scan_reports";

export function getSavedScanReports() {
  try {
    const saved = sessionStorage.getItem(REPORTS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScanReport({ scanType, target, scanResult }) {
  if (!target || !scanResult || typeof scanResult !== "object") {
    throw new Error("A valid scan target and scan result are required to save a report.");
  }

  const reports = getSavedScanReports();
  const report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scanType: scanType || "Security Scan",
    target,
    scanResult,
    createdAt: new Date().toISOString(),
  };

  try {
    // Keep the most recent 25 completed scans in this tab.
    sessionStorage.setItem(
      REPORTS_STORAGE_KEY,
      JSON.stringify([report, ...reports].slice(0, 25))
    );
  } catch {
    throw new Error("The scan completed, but this browser could not save it for the Reports page. Please check browser storage settings.");
  }

  return report;
}
