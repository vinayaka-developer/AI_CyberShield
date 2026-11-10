
import { useState } from "react";
import {
  Code2,
  FileArchive,
  Search,
  LoaderCircle,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Upload,
  FileCode2,
  FileSearch,
  Bug,
  Hash,
  Target,
  FolderCode,
  FileDown,
} from "lucide-react";

import {
  scanSourceCode,
  scanSourceCodeZip,
  generatePDFReport,
  saveScanReport,
} from "../services/scanService";

// Severity badge colors
function getSeverityStyle(severity) {
  switch (String(severity || "").toLowerCase()) {
    case "critical":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/30";
  }
}

function SourceCodeScanner() {
  const [activeTab, setActiveTab] = useState("code");
  const [sourceCode, setSourceCode] = useState("");
  const [zipFile, setZipFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");

  // Scan Python code or ZIP project
  async function handleScan() {
    setError("");
    setPdfError("");
    setResult(null);

    if (activeTab === "code" && !sourceCode.trim()) {
      setError("Please enter some Python code.");
      return;
    }

    if (activeTab === "zip" && !zipFile) {
      setError("Please select a ZIP file.");
      return;
    }

    setLoading(true);

    try {
      const data =
        activeTab === "code"
          ? await scanSourceCode(sourceCode)
          : await scanSourceCodeZip(zipFile);

      setResult(data);

      const scanTarget =
        activeTab === "code"
          ? "Python Source Code Scan"
          : zipFile?.name || "ZIP Source Code Scan";

      saveScanReport({
        scanType: activeTab === "code" ? "Python Source Code Scan" : "ZIP Source Code Scan",
        target: scanTarget,
        scanResult: data,
      });
    } catch (err) {
      setError(err.message || "Source code scan failed.");
    } finally {
      setLoading(false);
    }
  }

  // Generate and download PDF report
  async function handleDownloadPDF() {
    if (!result) return;

    setPdfLoading(true);
    setPdfError("");

    try {
      const scanName =
        activeTab === "code"
          ? "Python Source Code Scan"
          : zipFile?.name || "ZIP Source Code Scan";

      const pdfBlob = await generatePDFReport(scanName, result);

      const objectUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "AI_CyberShield_Source_Code_Report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (err) {
      setPdfError(err.message || "PDF report download failed.");
    } finally {
      setPdfLoading(false);
    }
  }

  // Handle ZIP file selection
  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setZipFile(null);
    setResult(null);
    setError("");
    setPdfError("");

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Please upload a ZIP file containing Python files.");
      event.target.value = "";
      return;
    }

    setZipFile(file);
  }

  // Switch between scanner tabs
  function changeTab(tab) {
    setActiveTab(tab);
    setResult(null);
    setError("");
    setPdfError("");
  }

  // Read actual backend response fields
  const findings = Array.isArray(result?.findings)
    ? result.findings
    : [];

  const scannedFiles = result?.scanned_files;
  const totalIssues = result?.total_issues ?? findings.length;
  const riskScore = result?.risk_score;
  const riskLevel = result?.risk_level;

  return (
    <div className="p-5 md:p-7 space-y-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Code2 size={20} />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Code Security
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Source Code Scanner
        </h1>

        <p className="text-gray-400 mt-2">
          Analyze Python source code and ZIP projects for security vulnerabilities.
        </p>
      </div>

      {/* Scanner Panel */}
      <div className="bg-[#121218] border border-gray-800 rounded-xl p-5 md:p-6">

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">

          <button
            onClick={() => changeTab("code")}
            disabled={loading || pdfLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition ${
              activeTab === "code"
                ? "bg-purple-600 text-white"
                : "bg-[#09090b] text-gray-400 border border-gray-800 hover:border-purple-500"
            }`}
          >
            <FileCode2 size={17} />
            Python Code
          </button>

          <button
            onClick={() => changeTab("zip")}
            disabled={loading || pdfLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition ${
              activeTab === "zip"
                ? "bg-purple-600 text-white"
                : "bg-[#09090b] text-gray-400 border border-gray-800 hover:border-purple-500"
            }`}
          >
            <FileArchive size={17} />
            ZIP Upload
          </button>

        </div>

        {/* Python Code Editor */}
        {activeTab === "code" && (
          <div>
            <label className="block text-sm text-gray-300 mb-3">
              Enter Python Source Code
            </label>

            <textarea
              value={sourceCode}
              onChange={(event) => setSourceCode(event.target.value)}
              placeholder={"# Paste your Python code here\n\nimport os\n\nprint('Hello World')"}
              disabled={loading || pdfLoading}
              spellCheck={false}
              className="w-full min-h-[280px] bg-[#09090b] border border-gray-700 rounded-lg p-4 text-green-300 font-mono text-sm outline-none focus:border-purple-500 resize-y"
            />
          </div>
        )}

        {/* ZIP Upload */}
        {activeTab === "zip" && (
          <div>
            <label className="block text-sm text-gray-300 mb-3">
              Upload Python Project ZIP
            </label>

            <label className="flex flex-col items-center justify-center gap-3 min-h-[220px] border-2 border-dashed border-gray-700 rounded-xl bg-[#09090b] cursor-pointer hover:border-purple-500 transition p-6">

              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Upload size={26} className="text-purple-400" />
              </div>

              <span className="text-white font-medium">
                {zipFile ? zipFile.name : "Choose a ZIP file"}
              </span>

              <span className="text-gray-500 text-sm text-center">
                Upload a ZIP archive containing Python (.py) files
              </span>

              <input
                type="file"
                accept=".zip,application/zip"
                onChange={handleFileChange}
                disabled={loading || pdfLoading}
                className="hidden"
              />

            </label>

            {zipFile && (
              <p className="text-green-400 text-sm mt-3">
                Selected: {zipFile.name}
              </p>
            )}
          </div>
        )}

        {/* Scan Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={loading || pdfLoading}
          className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}

          {loading ? "Analyzing..." : "Scan Source Code"}
        </button>

        {loading && (
          <p className="text-purple-400 text-sm mt-3">
            Sending your source code to the backend scanner...
          </p>
        )}

      </div>

      {/* Structured Security Report */}
      {result !== null && (
        <div className="space-y-5">

          {/* Report Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={21} className="text-purple-400" />

              <h2 className="text-xl font-semibold text-white">
                Source Code Security Report
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle2 size={15} />
                Backend response received
              </span>

              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {pdfLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <FileDown size={16} />
                )}

                {pdfLoading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* PDF Error */}
          {pdfError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {pdfError}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FolderCode size={17} />
                Files Scanned
              </div>

              <p className="text-3xl font-bold text-white mt-3">
                {scannedFiles ?? "N/A"}
              </p>
            </div>

            <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Bug size={17} />
                Security Findings
              </div>

              <p className="text-3xl font-bold text-white mt-3">
                {totalIssues}
              </p>
            </div>

            {riskScore !== undefined && riskScore !== null && (
              <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Target size={17} />
                  Risk Score
                </div>

                <p className="text-3xl font-bold text-white mt-3">
                  {riskScore}
                  <span className="text-sm text-gray-500 font-normal">
                    {" "}/ 100
                  </span>
                </p>

                <div className="w-full h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(riskScore) || 0))}%`,
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Risk Classification */}
          {riskLevel && (
            <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Risk Classification
              </p>

              <p className="text-2xl font-bold text-white mt-2">
                {riskLevel}
              </p>
            </div>
          )}

          {/* Findings */}
          <div className="bg-[#121218] border border-gray-800 rounded-xl p-5 md:p-6">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bug size={19} className="text-purple-400" />

                <h3 className="text-lg font-semibold text-white">
                  Security Findings
                </h3>
              </div>

              <span className="text-xs text-gray-500">
                {findings.length} finding(s)
              </span>
            </div>

            {findings.length > 0 ? (
              <div className="space-y-4">

                {findings.map((finding, index) => (
                  <div
                    key={`${finding.test_id || "finding"}-${index}`}
                    className="bg-[#09090b] border border-gray-800 rounded-lg p-4"
                  >

                    <div className="flex items-start justify-between gap-3 flex-wrap">

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <AlertCircle
                            size={17}
                            className="text-purple-400"
                          />
                        </div>

                        <div>
                          <h4 className="text-white font-medium">
                            {finding.issue || "Unnamed security finding"}
                          </h4>

                          <p className="text-gray-500 text-xs mt-1">
                            Finding #{index + 1}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs border px-3 py-1 rounded-full font-medium ${getSeverityStyle(finding.severity)}`}
                      >
                        {finding.severity || "Unknown"}
                      </span>

                    </div>

                    {/* Finding Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                      {finding.confidence && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Target size={15} className="text-purple-400" />
                          Confidence:
                          <span className="text-white">
                            {finding.confidence}
                          </span>
                        </div>
                      )}

                      {finding.file && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
                          <FileCode2 size={15} className="text-purple-400 shrink-0" />
                          <span className="text-white break-all">
                            {finding.file}
                          </span>
                        </div>
                      )}

                      {finding.line !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Hash size={15} className="text-purple-400" />
                          Line:
                          <span className="text-white">
                            {finding.line}
                          </span>
                        </div>
                      )}

                      {finding.test_id && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FileSearch size={15} className="text-purple-400" />
                          Test ID:
                          <span className="text-white">
                            {finding.test_id}
                          </span>
                        </div>
                      )}

                    </div>

                    {finding.recommendation && (
                      <div className="mt-4 border-t border-gray-800 pt-3">
                        <p className="text-purple-400 text-sm font-medium">
                          Recommendation
                        </p>

                        <p className="text-gray-300 text-sm mt-2">
                          {finding.recommendation}
                        </p>
                      </div>
                    )}

                  </div>
                ))}

              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2
                  size={30}
                  className="text-green-400 mx-auto mb-3"
                />

                <p className="text-white font-medium">
                  No security findings returned
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  The backend did not report any findings for this scan.
                </p>
              </div>
            )}

          </div>

          {/* Disclaimer */}
          <p className="text-gray-500 text-xs">
            Static analysis may miss vulnerabilities or produce false positives.
            Review findings before making security decisions.
          </p>

        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="bg-[#121218] border border-dashed border-gray-800 rounded-xl p-10 text-center">

          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Code2 size={26} className="text-purple-400" />
          </div>

          <h3 className="text-white font-semibold">
            Ready to analyze your code
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Paste Python code or upload a ZIP project to begin.
          </p>

        </div>
      )}

    </div>
  );
}

export default SourceCodeScanner;
