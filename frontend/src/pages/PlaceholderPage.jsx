
import { ShieldCheck, Clock3 } from "lucide-react";

function PlaceholderPage({ title, description }) {
  return (
    <main className="p-8 max-w-7xl mx-auto">

      <div className="flex items-center gap-2 text-violet-400 mb-4">
        <ShieldCheck size={20} />
        <span className="text-sm font-medium">
          AI Security Workspace
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        {title}
      </h1>

      <p className="text-gray-400 mb-8">
        {description}
      </p>

      <div className="bg-[#121218] border border-white/10 rounded-2xl p-8">

        <div className="flex items-center gap-3 mb-4">
          <Clock3 className="text-violet-400" size={22} />

          <h2 className="text-white font-semibold text-lg">
            Backend Integration Pending
          </h2>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed">
          This page is currently under frontend development.
          Its functionality will be connected to the existing
          FastAPI backend when the required API endpoints
          are available.
        </p>

      </div>

    </main>
  );
}

export default PlaceholderPage;
