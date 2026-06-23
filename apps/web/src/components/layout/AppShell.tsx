import { NavLink, Outlet } from "react-router-dom";
import { ReactNode } from "react";

const NAV = [
  { to: "/dashboard",   icon: "📊", label: "Dashboard"   },
  { to: "/pos",         icon: "🛒", label: "POS"          },
  { to: "/inventory",   icon: "📦", label: "Inventory"    },
  { to: "/banking",     icon: "🏦", label: "Banking"      },
  { to: "/accounting",  icon: "📒", label: "Accounting"   },
  { to: "/reports",     icon: "📈", label: "Reports"      },
  { to: "/ai-insights", icon: "🤖", label: "AI Insights"  },
  { to: "/crm",         icon: "👥", label: "CRM"          },
  { to: "/hr-payroll",  icon: "🧑‍💼", label: "HR & Payroll" },
  { to: "/settings",    icon: "⚙️", label: "Settings"     },
];

export default function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-navy flex flex-col text-white overflow-y-auto shrink-0">
        <div className="px-5 py-4 text-xl font-bold tracking-wide border-b border-white/10">
          ☰ <span className="text-teal">Nexa</span>Biz
        </div>
        <nav className="flex-1 py-2">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
                 ${isActive ? "bg-teal font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`
              }
            >
              <span className="w-5 text-center">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main shell */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-border flex items-center gap-3 px-6">
          <input
            type="text"
            placeholder="🔍  Search modules, records, reports…"
            className="flex-1 max-w-md border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal"
          />
          <div className="ml-auto flex items-center gap-4">
            <span className="cursor-pointer">🔔</span>
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">NB</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
}