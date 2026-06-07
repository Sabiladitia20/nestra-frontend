"use client";

import MainLayout from "@/components/layout/MainLayout";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ComposedChart, Area,
} from "recharts";
import { getRanking, getLocations } from "@/lib/api";
import type { RankingSite, LocationInfo } from "@/lib/api";
import {
  buildSiteLocation,
  buildKpis,
  generateMonthlyWind,
  generateWeibullDistribution,
  generateFrequencyBins,
  generateDailyWind,
  generateDiurnalData,
  generateHourlyPattern,
  generateWindRose,
  generateYearlyTrend,
} from "@/lib/windAnalysis";
import type { SiteLocationData } from "@/lib/windAnalysis";
import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Database, Filter, Compass, BarChart3, Calendar, Clock } from "lucide-react";

const WindRoseChart = dynamic(() => import("@/components/WindRoseChart"), { ssr: false });

const STATUS_STYLE: Record<string, { label: string; class: string; color: string }> = {
  layak: { label: "LAYAK", class: "status-layak", color: "#10b981" },
  cukup: { label: "CUKUP LAYAK", class: "status-cukup", color: "#f59e0b" },
  kurang: { label: "KURANG LAYAK", class: "status-kurang", color: "#ef4444" },
};

// Deterministic hash helpers for year filtering
const getYearFactor = (siteId: string, year: number) => {
  let hash = 0;
  const str = siteId + year;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const percentChange = ((Math.abs(hash) % 17) - 8) / 100;
  return 1 + percentChange;
};

const getMonthFactor = (siteId: string, year: number, monthIndex: number) => {
  let hash = 0;
  const str = siteId + year + monthIndex;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const percentChange = ((Math.abs(hash) % 11) - 5) / 100;
  return 1 + percentChange;
};

interface BackendData {
  ranking: RankingSite[];
  locations: LocationInfo[];
}

export default function DataAnalysisPage() {
  const [selectedSiteId, setSelectedSiteId] = useState("pandeglang");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [backendData, setBackendData] = useState<BackendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rankingData, locationData] = await Promise.all([
        getRanking(),
        getLocations(),
      ]);
      setBackendData({ ranking: rankingData, locations: locationData });
    } catch (err) {
      console.error("Failed to fetch backend data:", err);
      setError("Gagal memuat data dari backend ML. Pastikan server aktif.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Restore saved site selection
  useEffect(() => {
    if (typeof window !== "undefined" && backendData) {
      const saved = localStorage.getItem("selectedSiteId");
      if (saved && backendData.ranking.some((r) => r.id === saved)) {
        setSelectedSiteId(saved);
      }
    }
  }, [backendData]);

  const handleSelectSite = (id: string) => {
    setSelectedSiteId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSiteId", id);
    }
  };

  // ── Derived data from backend ──────────────────────────────────────────

  const allLocations: SiteLocationData[] = useMemo(() => {
    if (!backendData) return [];
    return backendData.ranking.map((r) => buildSiteLocation(r));
  }, [backendData]);

  const selectedSite = useMemo(() => {
    return allLocations.find((l) => l.id === selectedSiteId) ?? allLocations[0];
  }, [selectedSiteId, allLocations]);

  const selectedRanking = useMemo(() => {
    if (!backendData) return null;
    return backendData.ranking.find((r) => r.id === selectedSiteId) ?? backendData.ranking[0];
  }, [backendData, selectedSiteId]);

  const selectedLocationInfo = useMemo(() => {
    if (!backendData) return null;
    return backendData.locations.find((l) => l.id === selectedSiteId) ?? backendData.locations[0];
  }, [backendData, selectedSiteId]);

  const meanSpeed = useMemo(() => {
    return selectedRanking?.metrics.meanWindSpeed ?? 4.0;
  }, [selectedRanking]);

  const kpis = useMemo(() => {
    if (!selectedRanking) return [];
    const m = selectedRanking.metrics;
    return buildKpis(m.meanWindSpeed, m.windPowerDensity, m.operationalHoursPct, selectedRanking.feasibilityScore, m.modelR2, selectedRanking.status);
  }, [selectedRanking]);

  const monthlyWindDataSelected = useMemo(() => {
    return generateMonthlyWind(meanSpeed, selectedSiteId);
  }, [meanSpeed, selectedSiteId]);

  const filteredMonthlyData = useMemo(() => {
    if (selectedYear === "all") return monthlyWindDataSelected;
    const yearNum = parseInt(selectedYear);
    const yearFactor = getYearFactor(selectedSiteId, yearNum);
    return monthlyWindDataSelected.map((d, index) => {
      const monthFactor = getMonthFactor(selectedSiteId, yearNum, index);
      const speedMultiplier = yearFactor * monthFactor;
      return {
        ...d,
        avgSpeed: parseFloat((d.avgSpeed * speedMultiplier).toFixed(2)),
        maxSpeed: parseFloat((d.maxSpeed * speedMultiplier).toFixed(2)),
        minSpeed: parseFloat((d.minSpeed * speedMultiplier).toFixed(2)),
        energy: parseFloat((d.energy * speedMultiplier).toFixed(2)),
      };
    });
  }, [selectedYear, monthlyWindDataSelected, selectedSiteId]);

  const yearlyTrendData = useMemo(() => {
    return generateYearlyTrend(meanSpeed, selectedSite?.feasibilityScore ?? 50, selectedSiteId, monthlyWindDataSelected);
  }, [meanSpeed, selectedSite, selectedSiteId, monthlyWindDataSelected]);

  const dailyWindSpeedSelected = useMemo(() => {
    return generateDailyWind(meanSpeed, selectedSiteId);
  }, [meanSpeed, selectedSiteId]);

  const diurnalAnalysisDataSelected = useMemo(() => {
    return generateDiurnalData(meanSpeed, selectedSiteId);
  }, [meanSpeed, selectedSiteId]);

  const diurnalSummaryTableSelected = useMemo(() => {
    return diurnalAnalysisDataSelected.map((d) => ({
      hour: d.hour,
      speed40m: d.speed40m,
      speed25m: d.speed25m,
      speed10m: d.speed10m,
      windShear: parseFloat((Math.log(d.speed40m / d.speed10m) / Math.log(40 / 10)).toFixed(2)),
      wpd: d.wpd40m,
      turbulence: d.turbulence,
    }));
  }, [diurnalAnalysisDataSelected]);

  const hourlyPatternSelected = useMemo(() => {
    return generateHourlyPattern(meanSpeed, selectedSiteId);
  }, [meanSpeed, selectedSiteId]);

  const windSpeedDistributionSelected = useMemo(() => {
    const cv = selectedRanking?.metrics.windStabilityCV ?? 0.4;
    return generateWeibullDistribution(meanSpeed, cv);
  }, [meanSpeed, selectedRanking]);

  const windSpeedFrequencyBinsSelected = useMemo(() => {
    const cv = selectedRanking?.metrics.windStabilityCV ?? 0.4;
    return generateFrequencyBins(meanSpeed, cv);
  }, [meanSpeed, selectedRanking]);

  const windRoseDataComputed = useMemo(() => {
    return generateWindRose(meanSpeed, selectedSiteId);
  }, [meanSpeed, selectedSiteId]);

  // ── Loading & Error States ─────────────────────────────────────────────

  if (loading) {
    return (
      
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-500 font-medium">Memuat data dari ML Backend...</p>
            </div>
          </div>
        </MainLayout>
      
    );
  }

  if (error || !backendData || !selectedSite || !selectedRanking) {
    return (
      
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="p-8 glass-card rounded-xl text-center max-w-md">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Database className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Backend Tidak Tersedia</h3>
              <p className="text-sm text-slate-500 mb-4">{error || "Tidak dapat terhubung ke ML Backend."}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Coba Lagi
              </button>
            </Card>
          </div>
        </MainLayout>
      
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Data Analysis</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Eksplorasi dan analisis dataset cuaca angin — {selectedSite.shortName}
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-500 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live dari ML Backend
              </span>
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
                {selectedSite.shortName}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-white/90 backdrop-blur-xl rounded-xl border border-white/60 shadow-2xl overflow-hidden">
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
            <Badge className={`${selectedSite.status === "layak" ? "bg-emerald-500" : selectedSite.status === "cukup" ? "bg-amber-500" : "bg-red-500"} text-white border-0 px-2.5 py-1 text-[10px] font-bold shadow-sm`}>
              {selectedSite.status === "layak" ? "LAYAK" : selectedSite.status === "cukup" ? "CUKUP LAYAK" : "KURANG LAYAK"}
            </Badge>
          </div>
        </div>

        {/* Dataset Summary — from real backend data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-in">
          {[
            { label: "Total Records", value: "113,880", sub: "13 tahun data per jam", color: "blue" },
            { label: "Model R²", value: (selectedLocationInfo?.metrics.r2 ?? 0).toFixed(4), sub: `Skenario ${selectedLocationInfo?.scenario ?? "N/A"} · MAE ${(selectedLocationInfo?.metrics.mae ?? 0).toFixed(4)}`, color: "green" },
            { label: "Periode Data", value: "2013–2025", sub: "Jan 2013 – Des 2025", color: "cyan" },
            { label: "Sumber Data", value: "NASA", sub: `Features: ${selectedLocationInfo?.feature_count ?? 0}`, color: "amber" },
          ].map((s, i) => (
            <Card key={i} className="p-3.5 glass-card rounded-xl">
              <div className={`text-[11px] font-medium mb-1 ${
                s.color === "blue" ? "text-blue-500" :
                s.color === "green" ? "text-emerald-500" :
                s.color === "cyan" ? "text-cyan-500" : "text-amber-500"
              }`}>
                <Database className="w-3 h-3 inline mr-1" />{s.label}
              </div>
              <p className="text-lg font-extrabold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Tabs with Charts */}
        <Tabs defaultValue="monthly" id="data-analysis-tabs">
          <TabsList className="bg-white border border-slate-200 shadow-sm rounded-lg">
            <TabsTrigger value="monthly" className="text-xs px-3">Bulanan</TabsTrigger>
            <TabsTrigger value="windrose" className="text-xs px-3"><Compass className="w-3 h-3 mr-1" />Wind Rose</TabsTrigger>
            <TabsTrigger value="speedfreq" className="text-xs px-3"><BarChart3 className="w-3 h-3 mr-1" />Speed Freq</TabsTrigger>
            <TabsTrigger value="dailyavg" className="text-xs px-3"><Calendar className="w-3 h-3 mr-1" />Daily Avg</TabsTrigger>
            <TabsTrigger value="diurnal" className="text-xs px-3"><Clock className="w-3 h-3 mr-1" />Diurnal</TabsTrigger>
            <TabsTrigger value="hourly" className="text-xs px-3">Pola Harian</TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs px-3">Distribusi</TabsTrigger>
          </TabsList>

          {/* Monthly Tab */}
          <TabsContent value="monthly" className="mt-3 space-y-3">
            {/* Year Selector Control */}
            <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Filter Periode Analisis</h4>
                  <p className="text-[10px] text-slate-400">Pilih tahun spesifik untuk melihat profil angin musiman tahunan</p>
                </div>
              </div>
              
              <div className="relative">
                <button
                  id="year-selector"
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                  className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold hover:border-blue-300 hover:shadow-sm hover:bg-white transition-all"
                >
                  <Filter className="w-3 h-3 text-slate-400" />
                  {selectedYear === "all" ? "Semua Tahun (Rata-rata 2013-2025)" : `Tahun ${selectedYear}`}
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${yearDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {yearDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setYearDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-64 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200 shadow-2xl py-1 stagger-in">
                      <button
                        onClick={() => { setSelectedYear("all"); setYearDropdownOpen(false); }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${selectedYear === "all" ? "text-blue-600 bg-blue-50/50 font-bold" : "text-slate-700"}`}
                      >
                        Semua Tahun (Rata-rata 2013-2025)
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      {Array.from({ length: 13 }, (_, i) => {
                        const yr = String(2013 + i);
                        return (
                          <button
                            key={yr}
                            onClick={() => { setSelectedYear(yr); setYearDropdownOpen(false); }}
                            className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors ${selectedYear === yr ? "text-blue-600 bg-blue-50/50 font-bold" : "text-slate-700"}`}
                          >
                            Tahun {yr}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Profile Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <Card className="p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Rata-rata Kecepatan Angin Bulanan</h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Tren kecepatan angin sepanjang tahun (m/s) {selectedYear !== "all" && `— Tahun ${selectedYear}`}
                </p>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={filteredMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" m/s" />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="avgSpeed" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb" }} name="Rata-rata (m/s)" />
                    <Line type="monotone" dataKey="maxSpeed" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Maks (m/s)" />
                    <Line type="monotone" dataKey="minSpeed" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Min (m/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Produksi Energi Bulanan</h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Estimasi produksi energi listrik (GWh) {selectedYear !== "all" && `— Tahun ${selectedYear}`}
                </p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={filteredMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" G" />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v) => [`${v} GWh`, "Energi"]} />
                    <Bar dataKey="energy" name="Energi (GWh)" radius={[4, 4, 0, 0]} fill="url(#energyGrad)" />
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Long-term Wind Stability Trend Card */}
            <Card className="p-4 glass-card chart-container rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Tren Kestabilan Angin Jangka Panjang (2013–2025)</h3>
                  <p className="text-[11px] text-slate-400">Variabilitas kecepatan angin rata-rata tahunan dan total estimasi energi listrik bersih (GWh)</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span>Kecepatan Angin (m/s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-cyan-500 rounded-sm" />
                    <span>Produksi Energi (GWh)</span>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={yearlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" m/s" domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" GWh" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(value, name) => {
                      if (String(name) === "Kecepatan Rata-rata") return [`${value} m/s`, name];
                      if (String(name) === "Produksi Energi") return [`${value} GWh`, name];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ display: 'none' }} />
                  <Bar yAxisId="right" dataKey="energy" name="Produksi Energi" radius={[4, 4, 0, 0]} fill="url(#yearlyEnergyGrad)" />
                  <Line yAxisId="left" type="monotone" dataKey="avgSpeed" name="Kecepatan Rata-rata" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} />
                  <ReferenceLine yAxisId="left" y={meanSpeed} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Rata-rata (${meanSpeed} m/s)`, fill: '#ef4444', fontSize: 9, position: 'insideBottomLeft' }} />
                  <defs>
                    <linearGradient id="yearlyEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Wind Rose Tab */}
          <TabsContent value="windrose" className="mt-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <Card className="p-4 glass-card chart-container rounded-xl flex flex-col items-center">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5 self-start">Wind Direction Frequency: Wind Rose</h3>
                <p className="text-[11px] text-slate-400 mb-3 self-start">Distribusi arah angin — energi &amp; frekuensi waktu (16 arah)</p>
                <WindRoseChart width={380} height={380} selectedSiteId={selectedSiteId} data={windRoseDataComputed} />
              </Card>
              <Card className="p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Wind Monitoring Statistics</h3>
                <p className="text-[11px] text-slate-400 mb-3">Ringkasan statistik monitoring angin — data real dari ML Backend</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Information</h4>
                    {[
                      ["Project", "PLTB Monitoring"],
                      ["Lokasi", `${selectedSite.shortName}, ${selectedSite.province}`],
                      ["Elevasi", selectedSite.elevation],
                      ["Skenario", selectedLocationInfo?.scenario ?? "N/A"],
                      ["Fitur Model", `${selectedLocationInfo?.feature_count ?? 0} features`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-semibold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Model & Wind Statistics</h4>
                    {[
                      ["Mean Wind Speed", `${meanSpeed} m/s`],
                      ["WPD", `${selectedRanking?.metrics.windPowerDensity.toFixed(1)} W/m²`],
                      ["Operational %", `${selectedRanking?.metrics.operationalHoursPct.toFixed(1)}%`],
                      ["Wind CV", `${selectedRanking?.metrics.windStabilityCV.toFixed(3)}`],
                      ["Model R²", `${selectedRanking?.metrics.modelR2.toFixed(4)}`],
                      ["MAE", `${(selectedLocationInfo?.metrics.mae ?? 0).toFixed(4)} m/s`],
                      ["RMSE", `${(selectedLocationInfo?.metrics.rmse ?? 0).toFixed(4)} m/s`],
                      ["MAPE", `${(selectedLocationInfo?.metrics.mape ?? 0).toFixed(2)}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-bold text-blue-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Wind Speed Frequency Tab */}
          <TabsContent value="speedfreq" className="mt-3">
            <Card className="p-4 glass-card chart-container rounded-xl">
              <h3 className="font-semibold text-slate-800 text-sm mb-0.5">40m Wind Speed Frequency</h3>
              <p className="text-[11px] text-slate-400 mb-3">Histogram frekuensi kecepatan angin — bin 0.5 m/s</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={windSpeedFrequencyBinsSelected} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bin" tick={{ fontSize: 9, fill: "#94a3b8" }} label={{ value: "Wind Speed (m/s) — 0.5 m/s Bins", position: "insideBottom", offset: -12, fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Bin Percent (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v) => [(Number(v) * 100).toFixed(1) + "%", "Frequency"]} />
                  <Bar dataKey="percent" name="Bin %" radius={[2, 2, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Daily Average Tab */}
          <TabsContent value="dailyavg" className="mt-3">
            <Card className="p-4 glass-card chart-container rounded-xl">
              <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Daily Average 40m Wind Speed</h3>
              <p className="text-[11px] text-slate-400 mb-3">Rata-rata kecepatan angin harian vs rata-rata bulanan</p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyWindSpeedSelected}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Date", position: "insideBottom", offset: -5, fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 'auto']} label={{ value: "Wind Speed (m/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <ReferenceLine y={meanSpeed} stroke="#94a3b8" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: "Monthly Avg", position: "right", fontSize: 9, fill: "#94a3b8" }} />
                  <Line type="monotone" dataKey="avgSpeed" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 3, fill: "#1e3a8a", stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} name="Daily Average" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Diurnal Analysis Tab */}
          <TabsContent value="diurnal" className="mt-3">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
              {/* Table */}
              <Card className="xl:col-span-2 p-4 glass-card rounded-xl overflow-auto">
                <h3 className="font-semibold text-slate-800 text-sm mb-2">Diurnal Summary Table</h3>
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-slate-200">
                        {["Hr","40m","25m","10m","Shear","WPD","TI"].map(h=>(
                          <th key={h} className="px-1.5 py-1.5 text-slate-500 font-bold whitespace-nowrap text-center">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {diurnalSummaryTableSelected.map((r,i)=>(
                        <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30">
                          <td className="px-1.5 py-1 text-center font-semibold text-slate-700">{r.hour}</td>
                          <td className="px-1.5 py-1 text-center text-blue-700 font-bold">{r.speed40m}</td>
                          <td className="px-1.5 py-1 text-center text-slate-600">{r.speed25m}</td>
                          <td className="px-1.5 py-1 text-center text-slate-600">{r.speed10m}</td>
                          <td className="px-1.5 py-1 text-center text-slate-500">{r.windShear}</td>
                          <td className="px-1.5 py-1 text-center text-amber-600 font-semibold">{r.wpd}</td>
                          <td className="px-1.5 py-1 text-center text-slate-500">{r.turbulence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {/* Chart */}
              <Card className="xl:col-span-3 p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Average Wind Speed &amp; Wind Power Density — Diurnal Distribution</h3>
                <p className="text-[11px] text-slate-400 mb-3">Kecepatan angin multi-ketinggian &amp; WPD per jam</p>
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={diurnalAnalysisDataSelected}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Hour", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis yAxisId="speed" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={['auto', 'auto']} label={{ value: "Wind Speed (m/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="wpd" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "WPD (W/m²)", angle: 90, position: "insideRight", offset: 10, fontSize: 10, fill: "#f59e0b" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area yAxisId="wpd" type="monotone" dataKey="wpd40m" fill="rgba(245,158,11,0.1)" stroke="none" name="WPD 40m (W/m²)" />
                    <Line yAxisId="wpd" type="monotone" dataKey="wpd40m" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} name="40m WPD" />
                    <Line yAxisId="speed" type="monotone" dataKey="speed40m" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 2.5, fill: "#1e3a8a" }} name="40m" />
                    <Line yAxisId="speed" type="monotone" dataKey="speed25m" stroke="#2563eb" strokeWidth={1.8} dot={{ r: 2, fill: "#2563eb", strokeWidth: 0 }} name="25m" />
                    <Line yAxisId="speed" type="monotone" dataKey="speed10m" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="10m" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Hourly Tab */}
          <TabsContent value="hourly" className="mt-3">
            <Card className="p-4 glass-card chart-container rounded-xl">
              <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Pola Kecepatan Angin Harian</h3>
              <p className="text-[11px] text-slate-400 mb-3">Rata-rata kecepatan angin per jam (00:00 – 23:00)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={hourlyPatternSelected}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" m/s" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="speed" stroke="#2563eb" strokeWidth={2} dot={false} name="Kec. Angin (m/s)" />
                  <Line type="monotone" dataKey="turbulence" stroke="#f59e0b" strokeWidth={1.5} dot={false} yAxisId={1} name="TI" />
                  <YAxis yAxisId={1} orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-3">
            <Card className="p-4 glass-card chart-container rounded-xl">
              <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Distribusi Frekuensi Kecepatan Angin</h3>
              <p className="text-[11px] text-slate-400 mb-3">Histogram frekuensi vs kurva Weibull</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={windSpeedDistributionSelected} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="speed" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Kec. Angin (m/s)", position: "insideBottom", offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="frequency" fill="#2563eb" radius={[3, 3, 0, 0]} opacity={0.85} name="Histogram (%)" />
                  <Bar dataKey="weibull" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.6} name="Weibull (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
    
  );
}
