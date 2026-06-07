"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Wind,
  Bot,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

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
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isOpen, close } = useMobileMenu();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-56 flex flex-col z-50 sidebar-scroll overflow-y-auto transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo & Mobile Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/20 flex-shrink-0">
              <img
                src="/images/nestra-logo.jpeg"
                alt="Nestra AI"
                className="w-full h-full object-cover"
              />
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
          <button 
            onClick={close}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
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
                  onClick={close}
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
                onClick={close}
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
      <div className="px-3 py-3 border-t border-white/[0.06] relative" ref={profileRef}>
        {/* Profile Popup */}
        {showProfile && (
          <div className="absolute bottom-full left-3 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 border-b border-slate-700">
              <p className="text-slate-200 text-sm font-semibold truncate">
                {userEmail ? userEmail.split("@")[0] : "User"}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {userEmail || "admin@nestra.id"}
              </p>
            </div>
            <div className="p-1">
              <button 
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors"
                onClick={() => {
                  setShowProfile(false);
                  router.push('/settings');
                }}
              >
                Pengaturan Akun
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 rounded transition-colors flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          </div>
        )}

        <div 
          className="flex items-center gap-2.5 px-2 py-2 cursor-pointer hover:bg-white/[0.05] rounded-lg transition-colors"
          onClick={() => setShowProfile(!showProfile)}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400/30 flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <img
              src="/images/profile.jpg"
              alt="User"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs font-semibold truncate">
              {userEmail ? userEmail.split("@")[0] : "User"}
            </p>
            <p className="text-slate-500 text-[10px] truncate">
              {userEmail || "Engineer · Admin"}
            </p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
