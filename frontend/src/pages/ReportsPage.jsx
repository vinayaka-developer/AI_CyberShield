import { useState } from "react";
import {
  FileText,
  FileDown,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  CalendarDays,
  Target,
} from "lucide-react";
import { generatePDFReport, getSavedScanReports } from "../services/scanService";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function ReportsPage() {
  const [reports] = useState(() => getSavedScanReports());
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  async function handleDownload(report) {
    setDownloadingId(report.id);
    setError("");

    try {
      const pdfBlob = await generatePDFReport(report.target, report.scanResult);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "AI_CyberShield_Report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setError(err.message || "Unable to generate the PDF report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-400 mb-3">
          <ShieldCheck size={20} />
          <span className="text-sm font-medium">AI Security Workspace</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Reports</h1>
        <p className="text-gray-400">Download PDF reports generated from your completed security scans.</p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {reports.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-white/15 bg-[#121218] p-8 md:p-12 text-center">
          <FileText size={34} className="mx-auto mb-4 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">No completed scans available</h2>
          <p className="mt-2 text-sm text-gray-400">Run a Website Scanner, Vulnerability Scanner, or Source Code Scanner first. Completed scan results will appear here while this browser tab remains open.</p>
        </section>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-gray-500">{reports.length} completed scan{reports.length === 1 ? "" : "s"} available in this session.</p>
          {reports.map((report) => {
            const score = report.scanResult?.risk_score;
            const level = report.scanResult?.risk_level;
            const findingCount = Array.isArray(report.scanResult?.findings)
              ? report.scanResult.findings.length
              : report.scanResult?.total_issues;

            return (
              <article key={report.id} className="rounded-2xl border border-white/10 bg-[#121218] p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                      <FileText size={18} />
                      <span className="text-xs font-semibold uppercase tracking-wide">{report.scanType}</span>
                    </div>
                    <h2 className="text-white font-semibold break-all">{report.target}</h2>
                    <p className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <CalendarDays size={14} /> {formatDate(report.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-400">
                      {score !== undefined && score !== null && (
                        <span className="flex items-center gap-1.5"><Target size={14} className="text-violet-400" /> Risk score: <strong className="text-white">{score}/100</strong></span>
                      )}
                      {level && <span>Risk level: <strong className="text-white">{level}</strong></span>}
                      {findingCount !== undefined && <span>Findings: <strong className="text-white">{findingCount}</strong></span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId !== null}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadingId === report.id ? <LoaderCircle size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {downloadingId === report.id ? "Generating PDF..." : "Download PDF"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default ReportsPage;
