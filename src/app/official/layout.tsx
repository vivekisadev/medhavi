"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DemoToolbar } from "@/components/demo/demo-toolbar";
import { LayoutDashboard, CheckCircle2, BarChart2, Settings, ScrollText, Moon, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const officialNav = [
  { href: "/official/dashboard", tab: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/official/dashboard?tab=queue", tab: "queue", label: "Verification queue", icon: CheckCircle2 },
  { href: "/official/dashboard?tab=analytics", tab: "analytics", label: "Analytics", icon: BarChart2 },
  { href: "/official/dashboard?tab=rules", tab: "rules", label: "Scheme settings", icon: Settings },
  { href: "/official/dashboard?tab=audit", tab: "audit", label: "Audit trail", icon: ScrollText },
];

function OfficialLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("niyomi-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F3EA] dark:bg-[#0B1220] font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#1B2A4A] dark:bg-[#0A101C] text-white sticky top-0 h-screen overflow-y-auto z-40">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-white">
            <img src="/logo.jpg" alt="Medhavi" className="h-full w-full object-cover" />
          </div>
          <span className="font-fraunces font-bold text-lg tracking-tight text-white">Medhavi</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {officialNav.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive
                    ? "bg-[#253961] text-white"
                    : "text-slate-300 hover:bg-[#253961]/50 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[#253961] space-y-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#253961] hover:bg-[#2d4573] transition-colors text-sm font-medium text-slate-200"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
          
          <div className="relative group cursor-pointer pt-2">
            <div className="group-hover:opacity-0 transition-opacity duration-200">
              <div className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider">Signed in as</div>
              <div className="font-bold text-sm text-white leading-tight truncate">vivek@medhavi.gov.in</div>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="absolute inset-0 top-2 flex items-center justify-center gap-2 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] rounded-xl opacity-0 group-hover:opacity-100 transition-all font-semibold text-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1B2A4A] dark:bg-[#0A101C] text-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-white">
            <img src="/logo.jpg" alt="Medhavi" className="h-full w-full object-cover" />
          </div>
          <span className="font-fraunces font-bold text-lg">Medhavi</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-10">
        {children}
      </main>

      <DemoToolbar />
    </div>
  );
}

export default function OfficialLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-[#F7F3EA] dark:bg-[#0B1220]" />}>
      <OfficialLayoutInner>{children}</OfficialLayoutInner>
    </Suspense>
  );
}
