"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";

import {
  Wind,
  Zap,
  TrendingUp,
  Star,
  MapPin,
  Ruler,
  Globe2,
  CalendarDays,
  CheckCircle2,
  Info,
  ChevronDown,
  Mountain,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import {
  allLocations,
  siteKpiData,
  siteMonthlyWindData,
} from "@/lib/mockData";

const SiteMap = dynamic(() => import("@/components/SiteMap"), { ssr: false });

const KPI_CONFIG = {
  blue: {
    bg: "glass-card",
    icon: "bg-blue-50 text-blue-600",
    text: "text-blue-600",
    border: "border-white/50",
    change: "text-blue-500",
    glow: "kpi-blue",
    metricGlow: "metric-glow-blue",
  },
  cyan: {
    bg: "glass-card",
    icon: "bg-cyan-50 text-cyan-600",
    text: "text-cyan-600",
    border: "border-white/50",
    change: "text-cyan-500",
    glow: "kpi-cyan",
    metricGlow: "metric-glow-cyan",
  },
  green: {
    bg: "glass-card",
    icon: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
    border: "border-white/50",
    change: "text-emerald-500",
    glow: "kpi-green",
    metricGlow: "metric-glow-green",
  },
  amber: {
    bg: "glass-card",
    icon: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
    border: "border-white/50",
    change: "text-amber-500",
    glow: "kpi-amber",
    metricGlow: "metric-glow-amber",
  },
};

const KPI_ICONS: Record<string, React.ElementType> = {
  Wind,
  Zap,
  TrendingUp,
  Star,
};

const STATUS_STYLE: Record<string, { label: string; class: string; color: string }> = {
  layak: { label: "LAYAK", class: "status-layak", color: "#10b981" },
  cukup: { label: "CUKUP LAYAK", class: "status-cukup", color: "#f59e0b" },
  kurang: { label: "KURANG LAYAK", class: "status-kurang", color: "#ef4444" },
};

export default function DashboardPage() {
  const [selectedSiteId, setSelectedSiteId] = useState("pandeglang");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedSiteId");
      if (saved && allLocations.some((loc) => loc.id === saved)) {
        setSelectedSiteId(saved);
      }
    }
  }, []);

  const handleSelectSite = (id: string) => {
    setSelectedSiteId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSiteId", id);
    }
  };

  const site = useMemo(
    () => allLocations.find((l) => l.id === selectedSiteId) ?? allLocations[0],
    [selectedSiteId]
  );
  const kpis = siteKpiData[selectedSiteId] ?? siteKpiData.pandeglang;
  const windData = siteMonthlyWindData[selectedSiteId] ?? siteMonthlyWindData.pandeglang;
  const statusInfo = STATUS_STYLE[site.status];

  return (
    
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Page Title + Location Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Dashboard Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan analisis potensi PLTB — {site.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Location Selector Dropdown */}
            <div className="relative">
              <button
                id="location-selector"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/50 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium hover:border-blue-300 hover:shadow-md hover:bg-white/90 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {site.shortName}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 z-50 w-[280px] sm:w-72 max-w-[calc(100vw-2rem)] bg-white/90 backdrop-blur-xl rounded-xl border border-white/60 shadow-2xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pilih Lokasi PLTB</p>
                    </div>
                    {allLocations.map((loc) => {
                      const st = STATUS_STYLE[loc.status];
                      const isActive = loc.id === selectedSiteId;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => { handleSelectSite(loc.id); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors ${isActive ? "bg-blue-50/50" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${st.color}15` }}>
                            <MapPin className="w-4 h-4" style={{ color: st.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                              {loc.shortName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{loc.province} · {loc.area}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold" style={{ color: st.color }}>
                              {loc.feasibilityScore}/100
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <Badge className={`${statusInfo.class} text-white border-0 px-2.5 py-1 text-[10px] font-bold shadow-sm`}>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Location Detail Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: Globe2, label: "Koordinat", value: site.coordinates },
            { icon: Ruler, label: "Luas", value: site.area },
            { icon: Mountain, label: "Elevasi", value: site.elevation },
          ].map((item) => (
            <div key={item.label} className="hidden sm:flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:bg-white/80 transition-all">
              <item.icon className="w-3 h-3 text-slate-400" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">{item.label}</p>
                <p className="text-[11px] font-medium text-slate-700">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 stagger-in">
          {kpis.map((kpi) => {
            const cfg = KPI_CONFIG[kpi.color as keyof typeof KPI_CONFIG];
            const Icon = KPI_ICONS[kpi.icon];
            return (
              <Card
                key={kpi.id}
                id={`kpi-${kpi.id}`}
                className={`relative overflow-hidden p-4 border ${cfg.border} ${cfg.bg} ${cfg.glow} hover:scale-[1.01] transition-all duration-300 rounded-xl`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg ${cfg.icon} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium ${cfg.change}`}>
                    ↑ {kpi.change.split(" ")[0]}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">{kpi.label}</p>
                  <div className="flex items-end gap-0.5">
                    <span className={`text-2xl font-extrabold ${cfg.text} ${cfg.metricGlow}`}>{kpi.value}</span>
                    <span className={`text-xs font-semibold ${cfg.text} mb-0.5 opacity-70`}>{kpi.unit}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{kpi.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Map + Site Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {/* Interactive Map */}
          <Card className="xl:col-span-3 p-4 glass-card rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Peta Lokasi PLTB</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Klik marker untuk memilih lokasi</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">
                {allLocations.length} Lokasi
              </Badge>
            </div>
            <div className="h-[300px] rounded-xl overflow-hidden">
              <SiteMap
                locations={allLocations}
                selectedId={selectedSiteId}
                onSelect={handleSelectSite}
              />
            </div>
          </Card>

          {/* Recommendation Panel */}
          <Card className="xl:col-span-2 p-4 glass-card flex flex-col rounded-xl">
            <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Status Rekomendasi</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              {site.shortName} — Berdasarkan analisis multi-kriteria
            </p>

            {/* Big status */}
            <div className="flex-1 flex flex-col items-center justify-center py-3">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${statusInfo.color}dd, ${statusInfo.color})`,
                  }}
                >
                  <span className="text-2xl font-extrabold">{site.feasibilityScore}</span>
                  <span className="text-[10px] font-medium opacity-80">/100</span>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: statusInfo.color }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <h2 className="mt-3 text-lg font-extrabold" style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </h2>
              <p className="text-xs text-slate-500 text-center mt-0.5">
                {site.status === "layak"
                  ? "Sangat direkomendasikan untuk PLTB"
                  : site.status === "cukup"
                  ? "Perlu kajian lebih lanjut"
                  : "Tidak direkomendasikan"}
              </p>
            </div>

            {/* Criteria bars */}
            <div className="space-y-2.5 mt-1">
              {[
                { label: "Kecepatan Angin", score: Math.min(100, site.feasibilityScore + 1), color: "#2563eb" },
                { label: "Infrastruktur", score: Math.max(60, site.feasibilityScore - 12), color: "#06b6d4" },
                { label: "Lingkungan", score: Math.min(100, site.feasibilityScore + 4), color: "#10b981" },
                { label: "Regulasi", score: Math.max(60, site.feasibilityScore - 9), color: "#f59e0b" },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span className="font-medium">{c.label}</span>
                    <span className="font-bold">{c.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${c.score}%`, background: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Lokasi <strong>{site.shortName}</strong> — {site.province} · Elevasi {site.elevation}
              </p>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {/* Monthly Wind Chart */}
          <Card className="xl:col-span-3 p-4 glass-card chart-container rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Distribusi Kecepatan Angin Bulanan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {site.shortName} — Rata-rata, maks, dan estimasi energi
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">2013–2025</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={windData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" GWh" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="maxSpeed"
                  fill="#eff6ff"
                  stroke="none"
                  name="Kec. Maks"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgSpeed"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", r: 2.5 }}
                  name="Kec. Rata-rata (m/s)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="energy"
                  fill="#06b6d4"
                  opacity={0.6}
                  radius={[3, 3, 0, 0]}
                  name="Energi (GWh)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Energy by Month Bar */}
          <Card className="xl:col-span-2 p-4 glass-card chart-container rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Produksi Energi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{site.shortName} — GWh per bulan</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={windData} margin={{ left: -15, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" G" />
                <Tooltip
                  formatter={(v: any) => [`${v} GWh`, "Energi"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="energy" radius={[4, 4, 0, 0]} name="Energi (GWh)">
                  {windData.map((_, i) => (
                    <rect
                      key={i}
                      fill={`hsl(${215 + (i / 11) * 25}, 75%, ${45 + (i / 11) * 18}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </MainLayout>
    
  );
}
