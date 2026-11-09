
import {
  Bell,
  Search,
  ShieldCheck,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Security Dashboard",
  "/chat": "AI Security Assistant",
  "/website-scanner": "Website Scanner",
  "/vulnerability-scanner": "Vulnerability Scanner",
  "/source-code-scanner": "Source Code Scanner",
  "/apk-scanner": "Android APK Scanner",
  "/exe-scanner": "Windows EXE Scanner",
  "/history": "Scan History",
  "/reports": "Security Reports",
  "/settings": "Settings",
};

function Topbar({
  onMenuClick,
  onToggleSidebar,
  isSidebarCollapsed,
}) {

  // Get the current URL
  const location = useLocation();

  // Find the current page title
  const currentTitle =
    pageTitles[location.pathname] || "AI_CyberShield";

  return (
    <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#101014]">

      <div className="flex items-center gap-3">

        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="text-gray-400 hover:text-white md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:block text-gray-400 hover:text-white"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={21} />
          ) : (
            <PanelLeftClose size={21} />
          )}
        </button>

        {/* Dynamic page title */}
        <div>
          <h2 className="text-white text-base md:text-lg font-semibold">
            {currentTitle}
          </h2>

          <p className="text-gray-500 text-xs md:text-sm">
            AI-powered security intelligence
          </p>
        </div>

      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-5">

        <button className="text-gray-400 hover:text-white">
          <Search size={20} />
        </button>

        <button className="text-gray-400 hover:text-white">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2 border border-white/10 rounded-xl px-2 md:px-3 py-2">

          <ShieldCheck
            size={18}
            className="text-violet-400"
          />

          <span className="hidden sm:inline text-sm text-gray-300">
            AI Security
          </span>

        </div>

      </div>

    </header>
  );
}

export default Topbar;
