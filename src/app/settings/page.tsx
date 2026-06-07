"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";

import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    
    <MainLayout>
      <div className="space-y-4 max-w-xl mx-auto stagger-in mt-10">
        <Card className="p-6 glass-card rounded-xl space-y-4 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-800">Pengaturan</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tema Dashboard</label>
              <div className="grid grid-cols-2 gap-3">
                {["light", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`p-3 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      theme === t 
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 font-extrabold" 
                        : "border-slate-200 bg-white/60 hover:bg-white text-slate-600"
                    }`}
                  >
                    {t === "light" ? "Terang (Light)" : "Gelap (Dark)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
    
  );
}
