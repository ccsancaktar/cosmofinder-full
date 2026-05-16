import { BarChart3, Database, LogOut, Search, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Overview", icon: Sparkles, end: true },
  { to: "/system", label: "System", icon: Database },
  { to: "/users", label: "Users", icon: Search },
  { to: "/activity", label: "Activity", icon: BarChart3 },
];

export default function AdminLayout({ children, onLogout }) {
  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#20163d,transparent_45%),linear-gradient(180deg,#0c0a17_0%,#090713_100%)]" />
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(245,185,51,0.15),transparent_18%),radial-gradient(circle_at_80%_12%,rgba(139,92,246,0.18),transparent_20%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/25 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-primary/20 bg-primary/10 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/75 mb-2">CosmoFinder</p>
                <h1 className="text-3xl font-black gradient-text">Admin</h1>
                <p className="text-sm text-gray-400 mt-3 leading-6">
                  Kullanıcı web’inden bağımsız operasyon ve monitoring arayüzü.
                </p>
              </div>

              <div className="flex flex-col gap-3 xl:items-end">
                <nav className="flex gap-2 overflow-x-auto pb-1 xl:justify-end">
                  {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                          isActive
                            ? "bg-primary text-[#0D0B1F] font-bold"
                            : "border border-transparent bg-white/[0.03] text-gray-300 hover:border-primary/20 hover:text-primary"
                        }`
                      }
                    >
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  ))}
                </nav>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300 transition hover:border-red-400/20 hover:text-red-300"
                >
                  <LogOut size={16} />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
