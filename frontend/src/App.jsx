
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import WebsiteScanner from "./pages/WebsiteScanner";
import VulnerabilityScanner from "./pages/VulnerabilityScanner";
import SourceCodeScanner from "./pages/SourceCodeScanner";
import ChatPage from "./pages/ChatPage";
import ReportsPage from "./pages/ReportsPage";
import SpeechToTextPage from "./pages/SpeechToTextPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#09090b] flex">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 min-w-0">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() =>
            setSidebarCollapsed((prev) => !prev)
          }
          isSidebarCollapsed={sidebarCollapsed}
        />

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/chat" element={<ChatPage />} />

          <Route
            path="/website-scanner"
            element={<WebsiteScanner />}
          />

          <Route
            path="/vulnerability-scanner"
            element={<VulnerabilityScanner />}
          />

          <Route
            path="/source-code-scanner"
            element={<SourceCodeScanner />}
          />

          <Route
            path="/speech-to-text"
            element={<SpeechToTextPage />}
          />

          <Route
            path="/apk-scanner"
            element={
              <PlaceholderPage
                title="Android APK Scanner"
                description="Analyze Android application security."
              />
            }
          />

          <Route
            path="/exe-scanner"
            element={
              <PlaceholderPage
                title="Windows EXE Scanner"
                description="Analyze Windows executable files."
              />
            }
          />

          <Route
            path="/history"
            element={
              <PlaceholderPage
                title="Scan History"
                description="View previous security investigations."
              />
            }
          />

          <Route path="/reports" element={<ReportsPage />} />

          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Application preferences and configuration."
              />
            }
          />

          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Page Not Found"
                description="The requested page does not exist."
              />
            }
          />

        </Routes>

      </div>

    </div>
  );
}

export default App;
