
import { useState } from "react";
import {
  Globe,
  Search,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Info,
  Activity,
  Lock,
} from "lucide-react";

import { scanUrl, saveScanReport } from "../services/scanService";

function WebsiteScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Dynamic risk colors
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-orange-400";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getRiskBackground = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-green-400";
      case "medium":
        return "bg-yellow-400";
      case "high":
        return "bg-orange-400";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format evidence returned by the backend
  const formatEvidence = (item) => {
    if (typeof item === "object" && item !== null) {
      return JSON.stringify(item, null, 2);
    }

    return String(item);
  };

  // Call the real backend API
  async function handleScan() {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await scanUrl(url.trim());
      setResult(data);
      saveScanReport({
        scanType: "Website URL Scan",
        target: url.trim(),
        scanResult: data,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const score = Number(result?.risk_score);
  const validScore =
    Number.isFinite(score) && score >= 0 && score <= 100;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Globe size={20} />

          <span className="text-sm font-semibold uppercase tracking-wider">
            Web Security
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Website Scanner
        </h1>

        <p className="text-gray-400 mt-2">
          Analyze website URLs and identify suspicious patterns
          and potential security risks.
        </p>
      </div>

      {/* URL Scanner Input */}
      <div className="bg-[#121218] border border-gray-800 rounded-xl p-6">

        <label className="block text-sm text-gray-300 mb-3">
          Enter Website URL
        </label>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !loading) {
                handleScan();
              }
            }}
            placeholder="https://example.com"
            disabled={loading}
            className="flex-1 min-w-0 bg-[#09090b] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 disabled:opacity-60"
          />

          <button
            onClick={handleScan}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Search size={18} />
            )}

            {loading ? "Scanning..." : "Scan Website"}
          </button>

        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
            <AlertCircle size={17} />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-sm mt-4">
            <Activity size={16} className="animate-pulse" />
            Sending scan request to the security backend...
          </div>
        )}

      </div>

      {/* Scan Results */}
      {result && (
        <div className="space-y-5">

          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div className="flex items-center gap-2">
              <ShieldCheck className="text-purple-400" size={21} />

              <h2 className="text-xl font-semibold text-white">
                Website Scan Report
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-full px-3 py-2 w-fit">
              <CheckCircle2 size={15} />
              Backend response received
            </div>

          </div>

          {/* Risk Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Risk Score Card */}
            <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Activity size={16} />
                Risk Score
              </div>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-bold text-white">
                  {validScore ? score : "N/A"}
                </span>

                <span className="text-gray-500 text-sm">
                  / 100
                </span>
              </div>

              {validScore && (
                <div
                  className="w-full bg-gray-800 rounded-full h-2 mt-5 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Website risk score"
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${getRiskBackground(result.risk_level)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Score returned by the backend
              </p>

            </div>

            {/* Risk Level Card */}
            <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <ShieldCheck size={16} />
                Risk Classification
              </div>

              <p className={`text-4xl font-bold mt-3 ${getRiskColor(result.risk_level)}`}>
                {result.risk_level ?? "Unknown"}
              </p>

              <p className="text-xs text-gray-500 mt-3">
                Classification returned by the backend
              </p>

            </div>

          </div>

          {/* Domain Information */}
          <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-purple-400" size={19} />

              <h3 className="text-white font-semibold">
                Domain Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="bg-[#09090b] rounded-lg p-4">
                <p className="text-gray-500 text-xs mb-2">
                  DOMAIN
                </p>

                <p className="text-white font-medium break-all">
                  {result.domain ?? "Not available"}
                </p>
              </div>

              <div className="bg-[#09090b] rounded-lg p-4">
                <p className="text-gray-500 text-xs mb-2">
                  PROTOCOL
                </p>

                <div className="flex items-center gap-2">
                  <Lock
                    size={16}
                    className={
                      result.scheme?.toLowerCase() === "https"
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  />

                  <p className="text-white font-medium uppercase">
                    {result.scheme ?? "Not available"}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Findings */}
          <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-purple-400" size={19} />

              <h3 className="text-white font-semibold">
                Security Findings
              </h3>

              <span className="ml-auto text-xs text-gray-500">
                {result.findings?.length ?? 0} items
              </span>
            </div>

            {result.findings?.length > 0 ? (
              <div className="space-y-3">

                {result.findings.map((finding, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-[#09090b] border border-gray-800 rounded-lg p-4"
                  >
                    <Info
                      size={18}
                      className="text-purple-400 mt-0.5 shrink-0"
                    />

                    <p className="text-gray-300 text-sm leading-6">
                      {finding}
                    </p>
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                No findings returned by the backend.
              </p>
            )}

          </div>

          {/* Evidence */}
          <div className="bg-[#121218] border border-gray-800 rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="text-purple-400" size={19} />

              <h3 className="text-white font-semibold">
                Scan Evidence
              </h3>

              <span className="ml-auto text-xs text-gray-500">
                {result.evidence?.length ?? 0} items
              </span>
            </div>

            {result.evidence?.length > 0 ? (
              <div className="space-y-3">

                {result.evidence.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#09090b] border border-gray-800 rounded-lg p-4"
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      Evidence {index + 1}
                    </p>

                    <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono">
                      {formatEvidence(item)}
                    </pre>
                  </div>
                ))}

              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[#09090b] rounded-lg p-4">
                <FileSearch size={18} className="text-gray-500" />

                <p className="text-gray-400 text-sm">
                  No evidence returned by the backend.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="bg-[#121218] border border-dashed border-gray-800 rounded-xl p-10 text-center">

          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Globe size={26} className="text-purple-400" />
          </div>

          <h3 className="text-white font-semibold">
            Ready to scan
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Enter a website URL above to start a security scan.
          </p>

        </div>
      )}

    </div>
  );
}

export default WebsiteScanner;
