"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

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
      <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-blue-200/50 cursor-pointer hover:ring-2 hover:ring-blue-300/40 hover:shadow-[0_0_12px_rgba(37,99,235,0.15)] transition-all flex-shrink-0">
        <img
          src="/images/profile.jpg"
          alt="Sabil Aditia"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </header>
  );
}
