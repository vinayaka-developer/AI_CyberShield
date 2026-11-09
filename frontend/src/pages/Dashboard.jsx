
import {
  Globe,
  Bug,
  Code,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    title: "Website Scanner",
    description: "Analyze website security and identify potential threats.",
    icon: Globe,
    path: "/website-scanner",
    category: "WEB SECURITY",
  },
  {
    title: "Vulnerability Scanner",
    description: "Investigate website vulnerabilities and security weaknesses.",
    icon: Bug,
    path: "/vulnerability-scanner",
    category: "THREAT ANALYSIS",
  },
  {
    title: "Source Code Scanner",
    description: "Analyze Python source code for potential security issues.",
    icon: Code,
    path: "/source-code-scanner",
    category: "CODE SECURITY",
  },
  {
    title: "AI Security Assistant",
    description: "Interact with AI for cybersecurity guidance and analysis.",
    icon: MessageSquare,
    path: "/chat",
    category: "AI INTELLIGENCE",
  },
];

function Dashboard() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

      {/* Welcome section */}
      <section className="mb-10">

        <div className="flex items-center gap-2 text-violet-400 mb-4">
          <ShieldCheck size={20} />

          <span className="text-sm font-semibold tracking-wide">
            AI SECURITY WORKSPACE
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              Welcome to AI_CyberShield
            </h1>

            <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Your intelligent cybersecurity workspace.
              Investigate threats, analyze vulnerabilities
              and strengthen your digital security.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 w-fit">

            <span className="w-2 h-2 rounded-full bg-violet-400" />

            <span className="text-xs text-violet-300">
              Frontend development
            </span>

          </div>

        </div>

      </section>

      {/* Security tools */}
      <section className="mb-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Security Tools
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Explore your cybersecurity tools
            </p>
          </div>

          <span className="text-xs text-gray-500">
            Backend integration
          </span>

        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >

                <Link
                  to={feature.path}
                  className="group relative overflow-hidden bg-[#121218] border border-white/10 rounded-2xl p-5 sm:p-6 block transition-all duration-300 hover:border-violet-500/50 hover:bg-[#17151F] hover:-translate-y-1"
                >

                  {/* Card top */}
                  <div className="flex items-center justify-between mb-6">

                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                      <Icon size={25} />
                    </div>

                    <ArrowUpRight
                      size={20}
                      className="text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                    />

                  </div>

                  {/* Category */}
                  <p className="text-[10px] font-semibold tracking-widest text-violet-400 mb-3">
                    {feature.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-violet-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom label */}
                  <div className="mt-6 pt-4 border-t border-white/5">

                    <span className="text-xs text-gray-500 group-hover:text-violet-400 transition-colors">
                      Open workspace
                    </span>

                  </div>

                </Link>

              </motion.div>
            );
          })}

        </div>

      </section>

    </main>
  );
}

export default Dashboard;
