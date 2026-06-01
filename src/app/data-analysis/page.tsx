"use client";

import MainLayout from "@/components/layout/MainLayout";
import { RequireAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
  ReferenceLine, ComposedChart, Area,
} from "recharts";
import {
  allLocations,
  siteMonthlyWindData,
  siteKpiData,
  windSpeedDistribution,
  windSpeedFrequencyBins,
  dailyWindSpeed,
  diurnalAnalysisData,
  diurnalSummaryTable,
} from "@/lib/mockData";
import { useState, useEffect, useMemo } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { Download, Filter, RefreshCw, TrendingUp, Database, Info, Compass, BarChart3, Calendar, Clock } from "lucide-react";

const WindRoseChart = dynamic(() => import("@/components/WindRoseChart"), { ssr: false });

const hourlyPattern = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h.toString().padStart(2, "0")}:00`,
  speed: 5.5 + Math.sin((h - 6) * Math.PI / 12) * 3.2 + (Math.random() - 0.5) * 0.8,
  turbulence: 0.06 + Math.random() * 0.06,
}));



const STATUS_STYLE: Record<string, { label: string; class: string; color: string }> = {
  layak: { label: "LAYAK", class: "status-layak", color: "#10b981" },
  cukup: { label: "CUKUP LAYAK", class: "status-cukup", color: "#f59e0b" },
  kurang: { label: "KURANG LAYAK", class: "status-kurang", color: "#ef4444" },
};

// Deterministic hash helpers for dynamic multi-year wind variability simulation
const getYearFactor = (siteId: string, year: number) => {
  let hash = 0;
  const str = siteId + year;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const percentChange = ((Math.abs(hash) % 17) - 8) / 100; // -0.08 s.d +0.08
  return 1 + percentChange;
};

const getMonthFactor = (siteId: string, year: number, monthIndex: number) => {
  let hash = 0;
  const str = siteId + year + monthIndex;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const percentChange = ((Math.abs(hash) % 11) - 5) / 100; // -0.05 s.d +0.05
  return 1 + percentChange;
};

export default function DataAnalysisPage() {
  const [selectedSiteId, setSelectedSiteId] = useState("pandeglang");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

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

  const selectedSite = useMemo(() => {
    return allLocations.find((l) => l.id === selectedSiteId) ?? allLocations[0];
  }, [selectedSiteId]);

  const kpis = useMemo(() => {
    return siteKpiData[selectedSiteId] ?? siteKpiData.pandeglang;
  }, [selectedSiteId]);

  const monthlyWindDataSelected = useMemo(() => {
    return siteMonthlyWindData[selectedSiteId] ?? siteMonthlyWindData.pandeglang;
  }, [selectedSiteId]);

  const filteredMonthlyData = useMemo(() => {
    if (selectedYear === "all") {
      return monthlyWindDataSelected;
    }
    const yearNum = parseInt(selectedYear);
    const yearFactor = getYearFactor(selectedSiteId, yearNum);
    
    return monthlyWindDataSelected.map((d, index) => {
      const monthFactor = getMonthFactor(selectedSiteId, yearNum, index);
      const speedMultiplier = yearFactor * monthFactor;
      
      const avgSpeed = parseFloat((d.avgSpeed * speedMultiplier).toFixed(2));
      const maxSpeed = parseFloat((d.maxSpeed * speedMultiplier).toFixed(2));
      const minSpeed = parseFloat((d.minSpeed * speedMultiplier).toFixed(2));
      const energy = parseFloat((d.energy * speedMultiplier).toFixed(2));
      
      return {
        ...d,
        avgSpeed,
        maxSpeed,
        minSpeed,
        energy,
      };
    });
  }, [selectedYear, monthlyWindDataSelected, selectedSiteId]);

  const yearlyTrendData = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      const year = 2013 + i;
      const yearFactor = getYearFactor(selectedSiteId, year);
      
      const baseAvgSpeed = monthlyWindDataSelected.reduce((sum, d) => sum + d.avgSpeed, 0) / monthlyWindDataSelected.length;
      const avgSpeed = parseFloat((baseAvgSpeed * yearFactor).toFixed(2));
      
      const baseTotalEnergy = monthlyWindDataSelected.reduce((sum, d) => sum + d.energy, 0);
      const totalEnergy = parseFloat((baseTotalEnergy * yearFactor).toFixed(1));
      
      const baseScore = selectedSite.feasibilityScore;
      const scoreOffset = (yearFactor - 1) * 100; 
      const feasibilityScore = parseFloat(Math.min(100, Math.max(0, baseScore + scoreOffset)).toFixed(1));
      
      return {
        year,
        avgSpeed,
        energy: totalEnergy,
        feasibilityScore,
      };
    });
  }, [selectedSiteId, monthlyWindDataSelected, selectedSite]);

  const meanSpeed = useMemo(() => {
    return parseFloat(kpis.find((k) => k.id === "avg-speed")?.value ?? "7.0");
  }, [kpis]);

  const dailyWindSpeedSelected = useMemo(() => {
    const factor = meanSpeed / 7.0;
    return dailyWindSpeed.map((d) => ({
      ...d,
      avgSpeed: parseFloat((d.avgSpeed * factor).toFixed(1)),
      monthlyAvg: meanSpeed,
    }));
  }, [meanSpeed]);

  const diurnalAnalysisDataSelected = useMemo(() => {
    const factor = meanSpeed / 7.0;
    return diurnalAnalysisData.map((d) => {
      const speed40m = parseFloat((d.speed40m * factor).toFixed(1));
      const speed25m = parseFloat((d.speed25m * factor).toFixed(1));
      const speed10m = parseFloat((d.speed10m * factor).toFixed(1));
      const wpd40m = Math.round(0.5 * 1.225 * Math.pow(speed40m, 3));
      return {
        ...d,
        speed40m,
        speed25m,
        speed10m,
        wpd40m,
      };
    });
  }, [meanSpeed]);

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
    const factor = meanSpeed / 7.0;
    return Array.from({ length: 24 }, (_, h) => {
      let peakHour = 14;
      if (selectedSiteId === "situbondo") peakHour = 17;
      else if (selectedSiteId === "sukabumi") peakHour = 12;
      
      const diurnal = Math.sin((h - peakHour) * Math.PI / 12) * 2.8;
      const baseSpeed = 5.5 * factor;
      const speed = Math.max(0.5, Number((baseSpeed + diurnal + (h % 3 === 0 ? 0.2 : -0.1)).toFixed(1)));
      const turbulence = 0.05 + ((h % 5) * 0.015) + (selectedSiteId === "pandeglang" ? 0.01 : 0);
      return {
        hour: `${h.toString().padStart(2, "0")}:00`,
        speed,
        turbulence: Number(turbulence.toFixed(3)),
      };
    });
  }, [meanSpeed, selectedSiteId]);

  const windSpeedDistributionSelected = useMemo(() => {
    const c = meanSpeed * 1.125;
    const k = selectedSiteId === "pandeglang" ? 2.3 : selectedSiteId === "bawean" ? 2.5 : 1.95;
    
    return Array.from({ length: 16 }, (_, i) => {
      const v = i * 1.5;
      const weibullVal = v === 0 ? 0 : (k / c) * Math.pow(v / c, k - 1) * Math.exp(-Math.pow(v / c, k));
      const freqVal = Math.max(0, weibullVal * 100 + (Math.sin(v) * 0.4));
      return {
        speed: `${v.toFixed(1)}`,
        frequency: parseFloat((freqVal).toFixed(1)),
        weibull: parseFloat((weibullVal * 100).toFixed(1)),
      };
    });
  }, [meanSpeed, selectedSiteId]);

  const windSpeedFrequencyBinsSelected = useMemo(() => {
    const c = meanSpeed * 1.125;
    const k = 2.15;
    return Array.from({ length: 30 }, (_, i) => {
      const v = i * 0.5;
      const weibullVal = v === 0 ? 0 : (k / c) * Math.pow(v / c, k - 1) * Math.exp(-Math.pow(v / c, k));
      return {
        bin: `${v.toFixed(1)}`,
        percent: parseFloat(Math.max(0.001, weibullVal * 0.5 + (Math.sin(v * 4) * 0.005)).toFixed(3)),
      };
    });
  }, [meanSpeed]);

  return (
    <RequireAuth>
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Data Analysis</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Eksplorasi dan analisis dataset cuaca angin — {selectedSite.name}
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

        {/* Dataset Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-in">
          {[
            { label: "Total Records", value: "113,880", sub: "13 tahun data per jam", color: "blue" },
            { label: "Data Coverage", value: "99.5%", sub: "Kelengkapan data", color: "green" },
            { label: "Periode Data", value: "2013–2025", sub: "Jan 2013 – Des 2025", color: "cyan" },
            { label: "Sumber Data", value: "NASA", sub: "Validated & cleaned", color: "amber" },
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
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: any) => [`${v} GWh`, "Energi"]} />
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
                    formatter={(value: any, name: any) => {
                      if (name === "Kecepatan Rata-rata") return [`${value} m/s`, name];
                      if (name === "Produksi Energi") return [`${value} GWh`, name];
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
                <p className="text-[11px] text-slate-400 mb-3 self-start">Distribusi arah angin — energi & frekuensi waktu (16 arah)</p>
                <WindRoseChart width={380} height={380} selectedSiteId={selectedSiteId} />
              </Card>
              <Card className="p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Wind Monitoring Statistics</h3>
                <p className="text-[11px] text-slate-400 mb-3">Ringkasan statistik monitoring angin bulanan</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Information</h4>
                    {[["Project","PLTB Monitoring"],["Lokasi",`${selectedSite.shortName}, ${selectedSite.province}`],["Elevasi",selectedSite.elevation],["Ketinggian Sensor","40m, 25m, 10m"],["Interval Data","10 Menit"]].map(([k,v])=>(<div key={k} className="flex justify-between text-[11px]"><span className="text-slate-500">{k}</span><span className="font-semibold text-slate-700">{v}</span></div>))}
                  </div>
                  <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">40m Monthly Statistics</h4>
                    {[["Mean Wind Speed",`${meanSpeed} m/s`],["Max 1-Sec Gust",`${(meanSpeed * 2.5).toFixed(1)} m/s`],["Std Dev",`${(meanSpeed * 0.12).toFixed(1)} m/s`],["Mean TI","0.15"],["Wind Shear","0.24"],["Prevailing Dir","SSE"],["Mean WPD",`${Math.round(0.5 * 1.225 * Math.pow(meanSpeed, 3))} W/m²`],["Data Recovery","100%"]].map(([k,v])=>(<div key={k} className="flex justify-between text-[11px]"><span className="text-slate-500">{k}</span><span className="font-bold text-blue-700">{v}</span></div>))}
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
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: any) => [(v * 100).toFixed(1) + "%", "Frequency"]} />
                  <Bar dataKey="percent" name="Bin %" radius={[2, 2, 0, 0]}>
                    {windSpeedFrequencyBinsSelected.map((_, i) => (<rect key={i} fill={`hsl(${220 - i * 2}, 65%, ${50 + i}%)`} />))}
                  </Bar>
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
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 20]} label={{ value: "Wind Speed (m/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#64748b" }} />
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
                        {["Hr","40m","25m","10m","Shear","WPD","TI"].map(h=>(<th key={h} className="px-1.5 py-1.5 text-slate-500 font-bold whitespace-nowrap text-center">{h}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      {diurnalSummaryTableSelected.map((r,i)=>(<tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30"><td className="px-1.5 py-1 text-center font-semibold text-slate-700">{r.hour}</td><td className="px-1.5 py-1 text-center text-blue-700 font-bold">{r.speed40m}</td><td className="px-1.5 py-1 text-center text-slate-600">{r.speed25m}</td><td className="px-1.5 py-1 text-center text-slate-600">{r.speed10m}</td><td className="px-1.5 py-1 text-center text-slate-500">{r.windShear}</td><td className="px-1.5 py-1 text-center text-amber-600 font-semibold">{r.wpd}</td><td className="px-1.5 py-1 text-center text-slate-500">{r.turbulence}</td></tr>))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {/* Chart */}
              <Card className="xl:col-span-3 p-4 glass-card chart-container rounded-xl">
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Average Wind Speed & Wind Power Density — Diurnal Distribution</h3>
                <p className="text-[11px] text-slate-400 mb-3">Kecepatan angin multi-ketinggian & WPD per jam</p>
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={diurnalAnalysisDataSelected}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Hour", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis yAxisId="speed" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[4, 9]} label={{ value: "Wind Speed (m/s)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="wpd" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "WPD (W/mÂ²)", angle: 90, position: "insideRight", offset: 10, fontSize: 10, fill: "#f59e0b" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area yAxisId="wpd" type="monotone" dataKey="wpd40m" fill="rgba(245,158,11,0.1)" stroke="none" name="WPD 40m (W/mÂ²)" />
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
    </RequireAuth>
  );
}
