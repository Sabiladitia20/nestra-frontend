"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Wind,
  Bot,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Data Analysis",
    href: "/data-analysis",
    icon: BarChart3,
  },
  {
    label: "Wind Prediction",
    href: "/wind-prediction",
    icon: Wind,
  },
  {
    label: "Nestra AI",
    href: "/report-generator",
    icon: Bot,
  },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Bantuan", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40 sidebar-scroll overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wind className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base tracking-tight leading-none">
            Nestra<span className="text-cyan-400">AI</span>
          </span>
          <p className="text-slate-500 text-[9px] font-medium tracking-wider uppercase mt-0.5">
            PLTB Analytics
          </p>
        </div>
      </div>

      {/* Nav section */}
      <div className="flex-1 px-3 py-3">
        <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase px-2 mb-2">
          Menu
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm relative",
                  isActive
                    ? "bg-blue-500/15 text-white font-semibold"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-3 border-t border-white/[0.06]" />

        <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase px-2 mb-2">
          Lainnya
        </p>
        <nav className="space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-200 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400/30 flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <img
              src="/images/profile.jpg"
              alt="Sabil Aditia"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs font-semibold truncate">Sabil Aditia</p>
            <p className="text-slate-500 text-[10px] truncate">Engineer · Admin</p>
          </div>
          <button className="p-1 rounded hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
