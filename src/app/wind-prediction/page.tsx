"use client";

import MainLayout from "@/components/layout/MainLayout";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wind,
  Zap,
  TrendingUp,
  Settings2,
  BarChart2,
  RefreshCw,
  Download,
  CheckCircle2,
  Brain,
  Layers,
  Activity,
  Target,
  Cpu,
  GitBranch,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  Gauge,
  Trophy,
  Signal,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  ComposedChart,
  Cell,
} from "recharts";
import {
  mlModels,
  featureScenarios,
  modelHyperparameters,
  predictionTimeline,
  scenarioModelComparison,
  featureImportance,
  windSpeedDistribution,
  windDirectionData,
} from "@/lib/mockData";
import {
  predictWindSpeed,
  getRanking,
  getLocations,
  type PredictResponse,
  type RankingSite,
  type LocationInfo,
} from "@/lib/api";

const windRoseData = windDirectionData.map((d) => ({
  direction: d.direction,
  frequency: d.frequency,
  speed: d.value,
}));

// ── Sample wind speed data generator (demo mode) ────────────────────────────
function generateSampleData(hours: number = 24): number[] {
  const base = 3.5 + Math.random() * 2;
  return Array.from({ length: hours }, (_, i) => {
    const diurnal = Math.sin(((i % 24) - 6) * Math.PI / 12) * 1.2;
    const noise = (Math.random() - 0.5) * 0.8;
    return Math.max(0.3, Number((base + diurnal + noise).toFixed(2)));
  });
}

// ── Status color mapping ────────────────────────────────────────────────────
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  sangat_layak: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  layak: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  kurang_layak: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  tidak_layak: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const statusLabels: Record<string, string> = {
  sangat_layak: "Sangat Layak",
  layak: "Layak",
  kurang_layak: "Kurang Layak",
  tidak_layak: "Tidak Layak",
};

export default function WindPredictionPage() {
  const [selectedModelId, setSelectedModelId] = useState("rf");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculated, setCalculated] = useState(true);

  // ── ML Prediction State ──────────────────────────────────────────────────
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [ranking, setRanking] = useState<RankingSite[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [targetTime, setTargetTime] = useState<string>("");
  const [sampleData, setSampleData] = useState<number[]>(generateSampleData());
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);

  // ── Init: set default target_time ────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const iso = now.toISOString().slice(0, 16);
    setTargetTime(iso);
  }, []);

  // ── Fetch locations from backend ─────────────────────────────────────────
  useEffect(() => {
    async function fetchLocations() {
      setIsLoadingLocations(true);
      try {
        const locs = await getLocations();
        setLocations(locs);

        // Try to read from localStorage first
        const saved = typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null;
        if (saved && locs.some((l) => l.id === saved)) {
          setSelectedLocation(saved);
        } else if (locs.length > 0) {
          setSelectedLocation(locs[0].id);
        }
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
        // Fallback locations if backend offline
        const fallbackLocs = [
          { id: "pandeglang", name: "Pandeglang", scenario: "S4", status: "sangat_layak", metrics: { mae: 0.142, rmse: 0.195, mape: 3.59, r2: 0.991 }, feature_count: 4 },
          { id: "bawean", name: "Bawean", scenario: "S4", status: "layak", metrics: { mae: 0.121, rmse: 0.170, mape: 3.94, r2: 0.993 }, feature_count: 4 },
          { id: "baron", name: "Baron", scenario: "S7", status: "kurang_layak", metrics: { mae: 0.131, rmse: 0.183, mape: 4.47, r2: 0.981 }, feature_count: 10 },
          { id: "situbondo", name: "Situbondo", scenario: "S7", status: "tidak_layak", metrics: { mae: 0.111, rmse: 0.155, mape: 5.44, r2: 0.972 }, feature_count: 10 },
          { id: "sukabumi", name: "Sukabumi", scenario: "S7", status: "kurang_layak", metrics: { mae: 0.149, rmse: 0.208, mape: 4.70, r2: 0.981 }, feature_count: 10 },
        ];
        setLocations(fallbackLocs);

        const saved = typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null;
        if (saved && fallbackLocs.some((l) => l.id === saved)) {
          setSelectedLocation(saved);
        } else {
          setSelectedLocation("pandeglang");
        }
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync to localStorage when selectedLocation changes ───────────────────
  useEffect(() => {
    if (selectedLocation && typeof window !== "undefined") {
      localStorage.setItem("selectedSiteId", selectedLocation);
    }
  }, [selectedLocation]);

  // ── Fetch ranking from backend ───────────────────────────────────────────
  useEffect(() => {
    async function fetchRanking() {
      setIsLoadingRanking(true);
      try {
        const data = await getRanking();
        setRanking(data);
      } catch {
        setRanking([]);
      } finally {
        setIsLoadingRanking(false);
      }
    }
    fetchRanking();
  }, []);

  // ── Predict handler ──────────────────────────────────────────────────────
  const handlePredict = useCallback(async () => {
    if (!selectedLocation || !targetTime) return;
    setIsPredicting(true);
    setPredictionError(null);
    setPredictionResult(null);

    try {
      const result = await predictWindSpeed({
        location: selectedLocation,
        recent_ws10m: sampleData,
        target_time: targetTime.includes("T") ? targetTime + ":00" : targetTime,
      });
      setPredictionResult(result);
      setBackendOnline(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Prediction failed";
      setPredictionError(message);
    } finally {
      setIsPredicting(false);
    }
  }, [selectedLocation, targetTime, sampleData]);

  // ── Regenerate sample data ───────────────────────────────────────────────
  const handleRegenerateSample = useCallback(() => {
    setSampleData(generateSampleData());
    setPredictionResult(null);
    setPredictionError(null);
  }, []);

  const [selectedScenario, setSelectedScenario] = useState("S7");

  // Sync selectedScenario when selectedLocation changes
  useEffect(() => {
    const locInfo = locations.find((l) => l.id === selectedLocation);
    if (locInfo?.scenario) {
      setSelectedScenario(locInfo.scenario);
    }
  }, [locations, selectedLocation]);

  const currentLocationInfo = useMemo(() => {
    return locations.find((l) => l.id === selectedLocation);
  }, [locations, selectedLocation]);

  const activeModel = useMemo(() => {
    const baseModel = mlModels.find((m) => m.id === selectedModelId) ?? mlModels[0];
    if (selectedModelId === "rf" && currentLocationInfo?.metrics) {
      return {
        ...baseModel,
        mae: currentLocationInfo.metrics.mae ?? baseModel.mae,
        rmse: currentLocationInfo.metrics.rmse ?? baseModel.rmse,
        mape: currentLocationInfo.metrics.mape ?? baseModel.mape,
        r2: currentLocationInfo.metrics.r2 ?? baseModel.r2,
      };
    }
    return baseModel;
  }, [selectedModelId, currentLocationInfo]);

  const activeScenario = useMemo(
    () => featureScenarios.find((s) => s.id === selectedScenario) ?? featureScenarios[7],
    [selectedScenario]
  );
  const hyperparams = modelHyperparameters[selectedModelId] ?? [];

  const handleCalculate = () => {
    setIsCalculating(true);
    setCalculated(false);
    setTimeout(() => {
      setIsCalculating(false);
      setCalculated(true);
    }, 1800);
  };

  const metricCards = [
    { label: "R² Score", value: activeModel.r2.toFixed(3), icon: Target, color: "blue", sub: "Coefficient of Determination" },
    { label: "MAE", value: activeModel.mae.toFixed(3), icon: Activity, color: "cyan", sub: "Mean Absolute Error (m/s)" },
    { label: "RMSE", value: activeModel.rmse.toFixed(3), icon: TrendingUp, color: "green", sub: "Root Mean Square Error (m/s)" },
    { label: "MAPE", value: `${activeModel.mape.toFixed(2)}%`, icon: BarChart2, color: "amber", sub: "Mean Abs. Percentage Error" },
  ];

  // Bar colors for feature importance
  const importanceColors = [
    "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
    "#06b6d4", "#22d3ee", "#67e8f9",
    "#10b981", "#34d399", "#6ee7b7",
    "#f59e0b", "#fbbf24",
  ];

  return (
    
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Wind Speed Prediction</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Prediksi kecepatan angin menggunakan model ML — Random Forest
            </p>
          </div>
        </div>

        {/* Real-Time ML Prediction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Real-Time Prediction Form & Result (Col span 2) */}
          <Card className="p-4 glass-card lg:col-span-2 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Real-Time ML Wind Speed Prediction</h3>
                  <p className="text-[10px] text-slate-500">Predict 1-hour ahead wind speed using live Random Forest models</p>
                </div>
              </div>
              {!backendOnline && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Backend Offline (Demo Mode)
                </Badge>
              )}
              {backendOnline && (
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Live API Connected
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Form Input */}
              <div className="md:col-span-5 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Pilih Lokasi PLTB
                  </label>
                  <Select value={selectedLocation} onValueChange={(val) => { if (val) setSelectedLocation(val); }}>
                    <SelectTrigger className="h-8 text-xs bg-white capitalize" id="predict-location-select">
                      <SelectValue placeholder="Pilih Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <span className="flex items-center gap-1.5 justify-between w-full">
                            <span className="font-medium">{loc.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Waktu Prediksi (Target)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-500">
                      24-Hour Wind History (WS10M)
                    </label>
                    <button
                      onClick={handleRegenerateSample}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Regenerate Sample
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 max-h-[85px] overflow-y-auto grid grid-cols-6 gap-1 scrollbar-thin">
                    {sampleData.map((val, idx) => (
                      <div key={idx} className="text-center p-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-600">
                        <span className="text-[8px] text-slate-400 block">t-{24 - idx}h</span>
                        <span className="font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handlePredict}
                  disabled={isPredicting || !selectedLocation || !targetTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Mengkalkulasi...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Jalankan Real-Time Prediksi
                    </>
                  )}
                </Button>

                {predictionError && (
                  <div className="p-2 text-[10px] bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{predictionError}</span>
                  </div>
                )}
              </div>

              {/* Prediction Result Display */}
              <div className="md:col-span-7 flex flex-col justify-between">
                {predictionResult ? (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-sm flex flex-col justify-between min-h-[90px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium opacity-90 uppercase tracking-wider">Kec. Angin Prediksi</span>
                          <Wind className="w-4 h-4 opacity-80" />
                        </div>
                        <div>
                          <span className="text-2xl font-extrabold">{predictionResult.predicted_ws10m.toFixed(2)}</span>
                          <span className="text-xs ml-1 font-medium">{predictionResult.unit}</span>
                        </div>
                        <span className="text-[9px] opacity-75 font-mono">Target: {new Date(predictionResult.target_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between min-h-[90px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Skenario Fitur</span>
                          <Layers className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <span className="text-base font-extrabold text-slate-800">{predictionResult.scenario}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Optimal feature selection</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-semibold text-slate-500">R² Score (Test)</span>
                          <Target className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-extrabold text-blue-600">{predictionResult.model_confidence_r2.toFixed(4)}</p>
                        <p className="text-[8px] text-slate-400">Koefisien determinasi</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-semibold text-slate-500">MAE (Test)</span>
                          <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        </div>
                        <p className="text-sm font-extrabold text-cyan-600">{predictionResult.model_test_mae.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">m/s</span></p>
                        <p className="text-[8px] text-slate-400">Mean Absolute Error</p>
                      </div>
                    </div>

                    {/* Quick Location Meta Info */}
                    {(() => {
                      const locInfo = locations.find((l) => l.id === predictionResult.location) || currentLocationInfo;
                      const statusKey = locInfo?.status || "sangat_layak";
                      const col = statusColors[statusKey] || statusColors.sangat_layak;
                      const label = statusLabels[statusKey] || "Sangat Layak";

                      return (
                        <div className={`p-2.5 ${col.bg} border ${col.border} rounded-xl flex items-center justify-between gap-2`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-700">
                                Status Lokasi: <span className="capitalize">{predictionResult.location.replace("_", " ")}</span>
                              </p>
                              <p className="text-[9px] text-slate-500">Model Random Forest siap beroperasi dengan akurasi prima.</p>
                            </div>
                          </div>
                          <Badge className={`${col.bg} ${col.text} border-0 text-[8px] font-bold py-0.5`}>
                            {label.toUpperCase()}
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="h-full border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-slate-50/30">
                    <Brain className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                    <p className="text-xs font-semibold text-slate-600">Siap Melakukan Prediksi</p>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mt-1">
                      Pilih lokasi PLTB dan masukkan waktu target prediksi untuk memproyeksikan kecepatan angin secara real-time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Feasibility Site Ranking Table (Col span 1) */}
          <Card className="p-4 glass-card rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Site Feasibility Ranking</h3>
                  <p className="text-[10px] text-slate-400">Urutan kelayakan lokasi PLTB terbaik</p>
                </div>
              </div>

              {isLoadingRanking ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-[10px] text-slate-400">Memuat data ranking...</span>
                </div>
              ) : ranking.length === 0 ? (
                /* Fallback Offline Ranking */
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {[
                    { rank: 1, name: "Pandeglang", score: 87.5, status: "sangat_layak", cat: "Kelas III (Sedang)" },
                    { rank: 2, name: "Bawean", score: 82.3, status: "layak", cat: "Kelas III (Sedang)" },
                    { rank: 3, name: "Baron", score: 68.9, status: "kurang_layak", cat: "Kelas II (Rendah)" },
                    { rank: 4, name: "Sukabumi", score: 64.2, status: "kurang_layak", cat: "Kelas II (Rendah)" },
                    { rank: 5, name: "Situbondo", score: 48.7, status: "tidak_layak", cat: "Kelas I (Sangat Rendah)" }
                  ].map((site) => {
                    const col = statusColors[site.status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
                    return (
                      <div key={site.rank} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${site.rank === 1 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            site.rank === 2 ? "bg-slate-100 text-slate-700" :
                              "bg-slate-50 text-slate-500"
                            }`}>
                            {site.rank}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{site.name}</p>
                            <p className="text-[8px] text-slate-400">{site.cat}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-xs font-black text-slate-800">{site.score}%</p>
                            <p className="text-[8px] text-slate-400">Score</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${col.bg} ${col.text} ${col.border}`}>
                            {statusLabels[site.status] || site.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {ranking.map((site) => {
                    const col = statusColors[site.status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
                    return (
                      <div key={site.rank} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${site.rank === 1 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            site.rank === 2 ? "bg-slate-100 text-slate-700" :
                              "bg-slate-50 text-slate-500"
                            }`}>
                            {site.rank}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{site.name}</p>
                            <p className="text-[8px] text-slate-400">{site.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-xs font-black text-slate-800">{(site.feasibilityScore * 100).toFixed(1)}%</p>
                            <p className="text-[8px] text-slate-400">Score</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${col.bg} ${col.text} ${col.border}`}>
                            {statusLabels[site.status] || site.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-2 text-[9px] text-slate-400 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
              * Ranking dihitung berdasarkan parameter: kec. rata-rata angin, stabilitas angin, dan kerapatan daya.
            </div>
          </Card>
        </div>

        {/* COMMENTED OUT - Model Selector + Scenario Selector + Metrics */}
        {false && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* Left Panel — Model & Scenario Config */}
            <Card className="p-4 glass-card xl:col-span-1 rounded-xl">
              <div className="flex items-center gap-1.5 mb-3">
                <Brain className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Konfigurasi Model</h3>
              </div>

              <div className="space-y-3">
                {/* Model Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Model ML
                  </label>
                  <Select value={selectedModelId} onValueChange={(val) => { if (val) setSelectedModelId(val); }}>
                    <SelectTrigger className="h-8 text-xs" id="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Traditional ML</div>
                      {mlModels.filter(m => m.category === "traditional").map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                            {m.name}
                          </span>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Deep Learning</div>
                      {mlModels.filter(m => m.category === "deep_learning").map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                            {m.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature Scenario */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Feature Scenario
                  </label>
                  <Select value={selectedScenario} onValueChange={(val) => { if (val) setSelectedScenario(val); }}>
                    <SelectTrigger className="h-8 text-xs" id="select-scenario">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {featureScenarios.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Scenario Features */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Features ({activeScenario.features.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeScenario.features.map((f) => (
                      <span key={f} className="px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-white border border-slate-200 text-slate-600">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected Model Badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg border" style={{ borderColor: activeModel.color + "40", background: activeModel.bgColor }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: activeModel.color + "20" }}>
                    <Cpu className="w-4 h-4" style={{ color: activeModel.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: activeModel.color }}>{activeModel.name}</p>
                    <p className="text-[9px] text-slate-400">{activeModel.category === "traditional" ? "Traditional ML" : "Deep Learning"}</p>
                  </div>
                </div>

                {/* Calculate Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs h-8"
                  id="btn-calculate"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghitung...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Jalankan Prediksi</>
                  )}
                </Button>
              </div>
            </Card>

            {/* Right Panel — Metric Cards + Prediction Chart */}
            <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {metricCards.map((r, i) => (
                <Card key={i} className={`p-3.5 border ${calculated ? "opacity-100" : "opacity-50"} transition-opacity duration-500 border-slate-200/80 shadow-sm rounded-xl`}>
                  <div className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center ${r.color === "blue" ? "bg-blue-50 text-blue-600" :
                    r.color === "cyan" ? "bg-cyan-50 text-cyan-600" :
                      r.color === "green" ? "bg-emerald-50 text-emerald-600" :
                        "bg-amber-50 text-amber-600"
                    }`}>
                    <r.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">{r.label}</p>
                  <div className="flex items-end gap-0.5">
                    <span className={`text-xl font-extrabold ${r.color === "blue" ? "text-blue-600" :
                      r.color === "cyan" ? "text-cyan-600" :
                        r.color === "green" ? "text-emerald-600" :
                          "text-amber-600"
                      }`}>{r.value}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">{r.sub}</p>
                </Card>
              ))}

              {/* Prediction vs Actual Chart */}
              <Card className="col-span-2 md:col-span-4 p-4 glass-card chart-container rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Prediksi vs Aktual — Wind Speed (m/s)</h3>
                    <p className="text-[11px] text-slate-400">48 jam data — Model: {activeModel.name} | Skenario: {selectedScenario}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500" style={{ borderColor: activeModel.color + "60", color: activeModel.color }}>
                    R² = {activeModel.r2}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={predictionTimeline} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={3} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" m/s" />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="actual" fill="#eff6ff" stroke="none" name="Aktual Area" />
                    <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Aktual (m/s)" />
                    <Line type="monotone" dataKey="predicted" stroke={activeModel.color} strokeWidth={2} dot={{ r: 1.5, fill: activeModel.color }} name={`Prediksi ${activeModel.shortName} (m/s)`} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* COMMENTED OUT - Perbandingan Model, Feature Importance, Hyperparameters */}
        {false && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            {/* Model Comparison Table */}
            <Card className="p-4 glass-card rounded-xl xl:col-span-1">
              <div className="flex items-center gap-1.5 mb-3">
                <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Perbandingan Model</h3>
              </div>
              <div className="space-y-2">
                {mlModels.map((m) => {
                  const isActive = m.id === selectedModelId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left ${isActive
                        ? "border-blue-200 bg-blue-50/50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.color + "15" }}>
                        <span className="text-[10px] font-extrabold" style={{ color: m.color }}>{m.shortName}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                          {m.name}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          R²={m.r2} · MAE={m.mae}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs font-extrabold" style={{ color: m.color }}>{(m.r2 * 100).toFixed(1)}%</span>
                        <span className="text-[8px] text-slate-400">Akurasi</span>
                      </div>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Feature Importance Bar */}
            <Card className="p-4 glass-card chart-container rounded-xl xl:col-span-1">
              <div className="mb-3">
                <h3 className="font-semibold text-slate-800 text-sm">Feature Importance</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Random Forest — Top fitur berdasarkan MDI</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 5, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[0, 0.4]} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: any) => [(v * 100).toFixed(1) + "%", "Importance"]} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} name="Importance">
                    {featureImportance.map((_, i) => (
                      <Cell key={i} fill={importanceColors[i % importanceColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Hyperparameters Panel */}
            <Card className="p-4 glass-card rounded-xl xl:col-span-1">
              <div className="flex items-center gap-1.5 mb-3">
                <Settings2 className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Hyperparameters</h3>
                <Badge className="text-[8px] ml-auto border-0 py-0" style={{ background: activeModel.bgColor, color: activeModel.color }}>
                  {activeModel.name}
                </Badge>
              </div>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {hyperparams.map((hp) => (
                  <div key={hp.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-600 font-mono">{hp.label}</span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono" style={{ color: activeModel.color }}>{hp.value}</span>
                  </div>
                ))}
              </div>

              {/* Rolling & Lag Config */}
              {selectedModelId === "rf" && (
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 mb-1">Lag Configuration</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[{ k: "lag1", v: "shift(1)" }, { k: "lag6", v: "shift(6)" }, { k: "lag24", v: "shift(24)" }].map((l) => (
                        <div key={l.k} className="text-center p-1 rounded bg-white border border-blue-100">
                          <p className="text-[9px] text-blue-400">{l.k}</p>
                          <p className="text-[10px] font-bold text-blue-700">{l.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-100">
                    <p className="text-[10px] font-bold text-cyan-600 mb-1">Rolling Configuration</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { k: "roll_mean_3h", v: "window=3" },
                        { k: "roll_mean_24h", v: "window=24" },
                        { k: "roll_std_3h", v: "window=3" },
                        { k: "min_periods", v: "1 / 2" },
                      ].map((r) => (
                        <div key={r.k} className="text-center p-1 rounded bg-white border border-cyan-100">
                          <p className="text-[9px] text-cyan-400">{r.k}</p>
                          <p className="text-[10px] font-bold text-cyan-700">{r.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Bottom Row: Wind Rose + Speed Distribution + Scenario R² Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {/* Wind Rose */}
          <Card className="p-4 glass-card chart-container rounded-xl">
            <div className="mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Wind Rose Diagram</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Distribusi arah & frekuensi angin</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={windRoseData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="direction" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar name="Frekuensi (%)" dataKey="frequency" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name="Kec. Angin (m/s)" dataKey="speed" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Speed Distribution */}
          <Card className="p-4 glass-card chart-container rounded-xl">
            <div className="mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Distribusi Kecepatan Angin</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Histogram vs Weibull Distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={windSpeedDistribution} margin={{ left: -15, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="speed" tick={{ fontSize: 9, fill: "#94a3b8" }} label={{ value: "m/s", position: "insideBottom", offset: -2, fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="frequency" fill="#2563eb" radius={[3, 3, 0, 0]} opacity={0.8} name="Histogram (%)" />
                <Bar dataKey="weibull" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.6} name="Weibull (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Scenario R² Comparison */}
          {false && (
            <Card className="p-4 glass-card chart-container rounded-xl">
              <div className="mb-3">
                <h3 className="font-semibold text-slate-800 text-sm">R² per Skenario Fitur</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan S0–S7 antar model</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scenarioModelComparison} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[0.94, 1.0]} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="RF" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Random Forest" />
                  <Line type="monotone" dataKey="LR" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 1.5 }} name="Linear Reg." />
                  <Line type="monotone" dataKey="SVR" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 1.5 }} name="SVR" />
                  <Line type="monotone" dataKey="CNN" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="CNN" />
                  <Line type="monotone" dataKey="Transformer" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 1.5 }} name="Transformer" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Feature Scenario Table */}
        {false && (
          <Card className="p-4 glass-card rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Feature Engineering Scenarios (S0–S7)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Pengaruh feature engineering terhadap performa Random Forest</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" id="btn-export-scenario">
                <Download className="w-3 h-3" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Skenario", "Deskripsi", "Jumlah Fitur", "Fitur Tambahan", "R² (RF)", "MAE (RF)", "Improvement"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-400 pb-2 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureScenarios.map((s, i) => {
                    const isActive = s.id === selectedScenario;
                    const improvement = i > 0
                      ? ((s.rfR2 - featureScenarios[0].rfR2) / featureScenarios[0].rfR2 * 100).toFixed(1)
                      : "—";
                    return (
                      <tr
                        key={s.id}
                        className={`border-b border-slate-50 hover:bg-blue-50/30 cursor-pointer transition-colors ${isActive ? "bg-blue-50/50" : ""}`}
                        onClick={() => setSelectedScenario(s.id)}
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1.5">
                            {isActive && <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                            <span className="font-medium text-slate-700 text-xs">{s.id}</span>
                            {s.id === "S7" && <Badge className="text-[8px] bg-emerald-50 text-emerald-600 border-0 py-0">Best</Badge>}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 text-xs max-w-[200px] truncate">{s.description}</td>
                        <td className="py-2.5 pr-4 text-slate-600 text-xs font-semibold">{s.features.length}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex flex-wrap gap-0.5">
                            {s.features.slice(5).map((f) => (
                              <span key={f} className="px-1 py-0 text-[8px] rounded bg-blue-50 text-blue-600 font-medium">{f}</span>
                            ))}
                            {s.features.length <= 5 && <span className="text-[10px] text-slate-400">baseline</span>}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 font-bold text-blue-600 text-xs">{s.rfR2.toFixed(3)}</td>
                        <td className="py-2.5 pr-4 font-medium text-slate-600 text-xs">{s.rfMae.toFixed(3)}</td>
                        <td className="py-2.5 pr-4">
                          {improvement !== "—" ? (
                            <span className="text-xs font-semibold text-emerald-600">+{improvement}%</span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
    
  );
}
