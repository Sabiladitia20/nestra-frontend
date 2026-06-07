"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  CheckCircle2,
  Info,
  ChevronDown,
  Mountain,
  RefreshCw,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
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
  Line,
} from "recharts";
import {
  getDashboardData,
  type DashboardSite,
} from "@/lib/api";
import {
  allLocations as fallbackLocations,
  siteKpiData as fallbackKpiData,
  siteMonthlyWindData,
} from "@/lib/mockData";

const SiteMap = dynamic(() => import("@/components/SiteMap"), { ssr: false });

// ── KPI Config ──────────────────────────────────────────────────────────────

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

// ── Status Styles (supports 4 API categories) ──────────────────────────────

const STATUS_STYLE: Record<string, { label: string; class: string; color: string }> = {
  sangat_layak: { label: "SANGAT LAYAK", class: "status-layak", color: "#10b981" },
  layak: { label: "LAYAK", class: "status-layak", color: "#10b981" },
  cukup: { label: "CUKUP LAYAK", class: "status-cukup", color: "#f59e0b" },
  kurang_layak: { label: "KURANG LAYAK", class: "status-cukup", color: "#f59e0b" },
  kurang: { label: "KURANG LAYAK", class: "status-kurang", color: "#ef4444" },
  tidak_layak: { label: "TIDAK LAYAK", class: "status-kurang", color: "#ef4444" },
};

// ── KPI Generator from API Data ─────────────────────────────────────────────

function generateKpis(site: DashboardSite) {
  const m = site.metrics;
  const wpd = m.windPowerDensity;
  // Estimate annual energy from WPD (simplified)
  const annualEnergy = Math.round(wpd * 3.6 * 10) / 10;
  // Capacity factor approximation from operational hours percentage
  const capacityFactor = m.operationalHoursPct;

  return [
    {
      id: "avg-speed",
      label: "Rata-rata Kecepatan Angin",
      value: m.meanWindSpeed.toFixed(2),
      unit: "m/s",
      change: `R² ${m.modelR2.toFixed(3)}`,
      trend: "up",
      color: "blue",
      icon: "Wind",
      description: "Diukur pada ketinggian 10m (WS10M) — Data ML",
    },
    {
      id: "wind-power-density",
      label: "Wind Power Density",
      value: wpd.toFixed(1),
      unit: "W/m²",
      change: `CV ${m.windStabilityCV.toFixed(2)}`,
      trend: wpd > 50 ? "up" : "down",
      color: "cyan",
      icon: "Zap",
      description: "Kerapatan daya angin rata-rata",
    },
    {
      id: "operational-hours",
      label: "Jam Operasional",
      value: capacityFactor.toFixed(1),
      unit: "%",
      change: `${site.bestScenario}`,
      trend: capacityFactor > 60 ? "up" : "down",
      color: "green",
      icon: "TrendingUp",
      description: "Persentase jam operasi efektif",
    },
    {
      id: "feasibility",
      label: "Tingkat Kelayakan",
      value: site.feasibilityScore.toFixed(1),
      unit: "/100",
      change: STATUS_STYLE[site.status]?.label ?? site.status,
      trend: site.feasibilityScore > 70 ? "up" : "down",
      color: "amber",
      icon: "Star",
      description: `Skor kelayakan komprehensif · Rank #${site.rank}`,
    },
  ];
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <div className="xl:col-span-3 h-[360px] bg-slate-100 rounded-xl" />
        <div className="xl:col-span-2 h-[360px] bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedSiteId, setSelectedSiteId] = useState("pandeglang");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sites, setSites] = useState<DashboardSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch data from API ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardData();
      setSites(data.sites);
      setBackendOnline(true);

      // Restore saved location if valid
      const saved = typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null;
      if (saved && data.sites.some((s) => s.id === saved)) {
        setSelectedSiteId(saved);
      } else if (data.sites.length > 0) {
        setSelectedSiteId(data.sites[0].id);
      }
    } catch (err) {
      console.error("Dashboard API error, falling back to mock data:", err);
      setBackendOnline(false);
      setError("API ML tidak tersedia. Menampilkan data fallback.");

      // Fallback to mockData
      const fallbackSites: DashboardSite[] = fallbackLocations.map((loc, idx) => ({
        id: loc.id,
        name: loc.name,
        shortName: loc.shortName,
        province: loc.province,
        coordinates: loc.coordinates,
        lat: loc.lat,
        lng: loc.lng,
        area: loc.area,
        elevation: loc.elevation,
        climate: loc.climate,
        dataSource: loc.dataSource,
        feasibilityScore: loc.feasibilityScore,
        status: loc.status,
        category: "-",
        bestScenario: "-",
        rank: idx + 1,
        metrics: {
          meanWindSpeed: 0,
          windPowerDensity: 0,
          operationalHoursPct: 0,
          windStabilityCV: 0,
          modelR2: 0,
        },
        modelMetrics: null,
      }));
      setSites(fallbackSites);

      const saved = typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null;
      if (saved && fallbackSites.some((s) => s.id === saved)) {
        setSelectedSiteId(saved);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Persist selection ───────────────────────────────────────────────────
  const handleSelectSite = (id: string) => {
    setSelectedSiteId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSiteId", id);
    }
  };

  // ── Derived Data ────────────────────────────────────────────────────────
  const site = useMemo(
    () => sites.find((l) => l.id === selectedSiteId) ?? sites[0],
    [selectedSiteId, sites]
  );

  const kpis = useMemo(() => {
    if (!site) return [];
    // If backend is online and we have real metrics, generate from API
    if (backendOnline && site.metrics.meanWindSpeed > 0) {
      return generateKpis(site);
    }
    // Fallback to mock KPI data
    return fallbackKpiData[selectedSiteId] ?? fallbackKpiData.pandeglang ?? [];
  }, [site, backendOnline, selectedSiteId]);

  const windData = siteMonthlyWindData[selectedSiteId] ?? siteMonthlyWindData.pandeglang;
  const statusInfo = site ? (STATUS_STYLE[site.status] ?? STATUS_STYLE.layak) : STATUS_STYLE.layak;

  // ── Loading State ───────────────────────────────────────────────────────
  if (isLoading || !site) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Backend Status Banner */}
        {!backendOnline && error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="ml-auto flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded text-[10px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Coba Lagi
            </button>
          </div>
        )}

        {/* Page Title + Location Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Dashboard Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan analisis potensi PLTB — {site.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Backend Online Badge */}
            {backendOnline && (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live API
              </Badge>
            )}

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
                    {sites.map((loc) => {
                      const st = STATUS_STYLE[loc.status] ?? STATUS_STYLE.layak;
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
                              {loc.feasibilityScore.toFixed(1)}/100
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
                    {kpi.change}
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
                {sites.length} Lokasi
              </Badge>
            </div>
            <div className="h-[300px] rounded-xl overflow-hidden">
              <SiteMap
                locations={sites}
                selectedId={selectedSiteId}
                onSelect={handleSelectSite}
              />
            </div>
          </Card>

          {/* Recommendation Panel */}
          <Card className="xl:col-span-2 p-4 glass-card flex flex-col rounded-xl">
            <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Status Rekomendasi</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              {site.shortName} — Berdasarkan analisis multi-kriteria ML
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
                  <span className="text-2xl font-extrabold">{site.feasibilityScore.toFixed(1)}</span>
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
                {site.status === "sangat_layak"
                  ? "Sangat direkomendasikan untuk PLTB"
                  : site.status === "layak"
                  ? "Direkomendasikan untuk PLTB"
                  : site.status === "kurang_layak" || site.status === "cukup"
                  ? "Perlu kajian lebih lanjut"
                  : "Tidak direkomendasikan"}
              </p>
              {site.category && site.category !== "-" && (
                <Badge variant="outline" className="mt-1.5 text-[9px] border-slate-200 text-slate-500">
                  {site.category}
                </Badge>
              )}
            </div>

            {/* Criteria bars — from real API metrics */}
            <div className="space-y-2.5 mt-1">
              {backendOnline && site.metrics.meanWindSpeed > 0 ? (
                // Real API-driven criteria
                [
                  { label: "Kecepatan Angin", score: Math.min(100, Math.round(site.metrics.meanWindSpeed * 15)), color: "#2563eb" },
                  { label: "Stabilitas (CV)", score: Math.round((1 - site.metrics.windStabilityCV) * 100), color: "#06b6d4" },
                  { label: "Jam Operasional", score: Math.round(site.metrics.operationalHoursPct), color: "#10b981" },
                  { label: "Akurasi Model", score: Math.round(site.metrics.modelR2 * 100), color: "#f59e0b" },
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
                ))
              ) : (
                // Fallback criteria
                [
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
                ))
              )}
            </div>

            {/* Info */}
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Lokasi <strong>{site.shortName}</strong> — {site.province} · Elevasi {site.elevation}
                {backendOnline && site.bestScenario !== "-" && (
                  <> · Skenario terbaik: <strong>{site.bestScenario}</strong></>
                )}
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
                  {windData.map((_: any, i: number) => (
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
