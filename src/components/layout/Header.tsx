"use client";

import { ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const routeTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Overview & Ringkasan" },
  "/data-analysis": { title: "Data Analysis", description: "Analisis dataset cuaca angin" },
  "/wind-prediction": { title: "Wind Prediction", description: "Prediksi & simulasi energi angin" },
  "/site-assessment": { title: "Site Assessment", description: "Penilaian kelayakan lokasi" },
  "/report-generator": { title: "Nestra AI", description: "Asisten AI interaktif & prediksi potensi PLTB" },
  "/settings": { title: "Settings", description: "Konfigurasi dashboard & preferensi akun" },
  "/help": { title: "Bantuan", description: "Pusat bantuan & dokumentasi analisis PLTB" },
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userEmail } = useAuth();
  
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const current = routeTitles[pathname] ?? { title: "Nestra", description: "" };

  return (
    <header
      className="fixed top-0 left-56 right-0 h-14 z-30 flex items-center px-5 gap-3"
      style={{
        background: "var(--header-bg, rgba(240, 242, 248, 0.7))",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Nestra</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-medium">{current.title}</span>
        </div>
      </div>



      {/* Status indicator */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
        Live
      </div>



      {/* User avatar */}
      <div className="relative" ref={profileRef}>
        <div 
          className="w-7 h-7 rounded-full overflow-hidden border-2 border-blue-200/50 cursor-pointer hover:ring-2 hover:ring-blue-300/40 hover:shadow-[0_0_12px_rgba(37,99,235,0.15)] transition-all flex-shrink-0"
          onClick={() => setShowProfile(!showProfile)}
        >
          <img
            src="/images/profile.jpg"
            alt="User"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Profile Popup */}
        {showProfile && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold truncate">
                {userEmail ? userEmail.split("@")[0] : "User"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                {userEmail || "admin@nestra.id"}
              </p>
            </div>
            <div className="p-1">
              <button 
                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                onClick={() => {
                  setShowProfile(false);
                  router.push('/settings');
                }}
              >
                Pengaturan Akun
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
