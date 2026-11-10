
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  AudioLines,
  Globe,
  Bug,
  Code,
  FileText,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "AI Assistant",
    icon: MessageSquare,
    path: "/chat",
  },
  {
    name: "Speech-to-Text",
    icon: AudioLines,
    path: "/speech-to-text",
  },
  {
    name: "Website Scanner",
    icon: Globe,
    path: "/website-scanner",
  },
  {
    name: "Vulnerability Scanner",
    icon: Bug,
    path: "/vulnerability-scanner",
  },
  {
    name: "Source Code Scanner",
    icon: Code,
    path: "/source-code-scanner",
  },
  {
    name: "Reports",
    icon: FileText,
    path: "/reports",
  },
];

function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          md:sticky md:top-0 md:z-30
          bg-[#101014] border-r border-white/10
          flex flex-col flex-shrink-0
          transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* Logo section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
              <Shield size={21} className="text-white" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-white text-sm font-bold">
                  AI_CyberShield
                </h2>

                <p className="text-gray-500 text-[10px]">
                  Security Intelligence
                </p>
              </div>
            )}

          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">

          {!isCollapsed && (
            <p className="text-gray-500 text-[10px] tracking-widest px-3 mb-4">
              WORKSPACE
            </p>
          )}

          <div className="space-y-2">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onClose}
                  title={isCollapsed ? item.name : ""}
                  className={({ isActive }) => `
                    flex items-center gap-3
                    px-3 py-3 rounded-xl
                    text-xs font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-violet-600/20 text-violet-400 border border-violet-500/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >

                  <Icon size={17} className="shrink-0" />

                  {!isCollapsed && (
                    <span>{item.name}</span>
                  )}

                </NavLink>
              );
            })}

          </div>

        </nav>

      </aside>
    </>
  );
}

export default Sidebar;
