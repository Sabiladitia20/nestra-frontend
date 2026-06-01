"use client";

import MainLayout from "@/components/layout/MainLayout";
import { RequireAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, AlertCircle, MapPin, Wind, Zap,
  Trees, FileCheck, Truck, Grid, TrendingUp, Info, Download,
} from "lucide-react";
import { assessmentCriteria, locationData, turbineScenarios } from "@/lib/mockData";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const criteria = [
  {
    id: "wind",
    label: "Sumber Daya Angin",
    icon: Wind,
    score: 88,
    weight: 30,
    status: "excellent",
    details: [
      { name: "Kec. rata-rata > 7 m/s", pass: true },
      { name: "CF > 35%", pass: true },
      { name: "Konsistensi musiman", pass: true },
      { name: "Turbulensi < 15%", pass: true },
    ],
    note: "Angin dominan dari arah Tenggara, konsisten sepanjang tahun.",
  },
  {
    id: "grid",
    label: "Infrastruktur Jaringan",
    icon: Grid,
    score: 75,
    weight: 25,
    status: "good",
    details: [
      { name: "Gardu 150kV < 15 km", pass: true },
      { name: "Kapasitas interkoneksi cukup", pass: true },
      { name: "Perlu upgrade transmisi", pass: false },
      { name: "Studi grid impact", pass: false },
    ],
    note: "Gardu induk PLN Pandeglang berjarak 12 km. Memerlukan jalur transmisi baru ±8 km.",
  },
  {
    id: "access",
    label: "Aksesibilitas & Transportasi",
    icon: Truck,
    score: 82,
    weight: 20,
    status: "good",
    details: [
      { name: "Jalan utama < 5 km", pass: true },
      { name: "Lebar jalan > 4m", pass: true },
      { name: "Kapasitas beban jalan", pass: true },
      { name: "Pelabuhan terdekat", pass: false },
    ],
    note: "Akses utama melalui Jalan Trans Banten. Perbaikan 3 km jalan perdesaan diperlukan.",
  },
  {
    id: "env",
    label: "Dampak Lingkungan",
    icon: Trees,
    score: 91,
    weight: 15,
    status: "excellent",
    details: [
      { name: "Bukan kawasan konservasi", pass: true },
      { name: "Tidak ada AMDAL negatif besar", pass: true },
      { name: "Hutan lindung terisolasi", pass: true },
      { name: "Migrasi satwa liar rendah", pass: true },
    ],
    note: "Wilayah sabana terbuka. Risiko lingkungan minimal. AMDAL dapat diselesaikan dalam 6 bulan.",
  },
  {
    id: "reg",
    label: "Regulasi & Perizinan",
    icon: FileCheck,
    score: 78,
    weight: 10,
    status: "good",
    details: [
      { name: "Masuk RTRW zona energi", pass: true },
      { name: "Izin prinsip Pemda", pass: true },
      { name: "Sertifikat lahan tersedia", pass: false },
      { name: "Izin pinjam pakai kawasan hutan", pass: false },
    ],
    note: "Sebagian lahan masih berstatus HGU. Proses konversi diperkirakan 12 bulan.",
  },
];

const radarData = criteria.map((c) => ({
  subject: c.label.split(" ")[0],
  score: c.score,
  target: 80,
}));

const SCORE_COLOR = (s: number) =>
  s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : "text-amber-600";
const STATUS_BADGE = (s: string) =>
  s === "excellent"
    ? "bg-emerald-50 text-emerald-600"
    : s === "good"
    ? "bg-blue-50 text-blue-600"
    : "bg-amber-50 text-amber-600";

export default function SiteAssessmentPage() {
  const totalScore = Math.round(
    criteria.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0)
  );

  return (
    <RequireAuth>
    <MainLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Site Assessment</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Penilaian komprehensif kelayakan lokasi pembangunan PLTB
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 h-8" id="btn-export-assessment">
              <Download className="w-3 h-3" /> Export Laporan
            </Button>
          </div>
        </div>

        {/* Location Header */}
        <Card className="p-4 border border-slate-200/80 shadow-sm rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{locationData.name}</h2>
                <p className="text-[11px] text-slate-500">{locationData.coordinates} · {locationData.area}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Skor Kelayakan</p>
                <p className="text-2xl font-extrabold text-emerald-600">{totalScore}<span className="text-sm text-slate-400">/100</span></p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <Badge className="status-layak text-white border-0 px-3 py-1.5 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> LAYAK
              </Badge>
            </div>
          </div>
        </Card>

        {/* Main Assessment Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Radar Chart */}
          <Card className="p-4 border border-slate-200/80 shadow-sm rounded-xl">
            <h3 className="font-semibold text-slate-800 text-sm mb-0.5">Radar Kelayakan</h3>
            <p className="text-[11px] text-slate-400 mb-2">Multi-kriteria assessment overview</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar name="Skor" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.35} />
                <Radar name="Target (80)" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeDasharray="4 2" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Score summary */}
            <div className="mt-2 space-y-1.5">
              {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <p className="text-[11px] text-slate-500 w-24 flex-shrink-0 truncate">{c.label.split(" ")[0]}</p>
                  <Progress value={c.score} className="flex-1 h-1" />
                  <span className={`text-[11px] font-bold w-7 text-right ${SCORE_COLOR(c.score)}`}>{c.score}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Criteria Cards */}
          <div className="xl:col-span-2 space-y-2.5">
            {criteria.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.id} id={`criteria-${c.id}`} className="p-3.5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      c.status === "excellent" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-slate-700 text-xs">{c.label}</h4>
                        <div className="flex items-center gap-1.5">
                          <Badge className={`text-[9px] border-0 ${STATUS_BADGE(c.status)}`}>
                            {c.status === "excellent" ? "Excellent" : "Good"}
                          </Badge>
                          <span className={`text-base font-extrabold ${SCORE_COLOR(c.score)}`}>{c.score}</span>
                          <span className="text-[10px] text-slate-400">/ 100</span>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <Progress value={c.score} className="h-1" />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
                        {c.details.map((d, i) => (
                          <div key={i} className="flex items-center gap-1 text-[11px]">
                            {d.pass ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                            )}
                            <span className={d.pass ? "text-slate-600" : "text-slate-400"}>{d.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                        <Info className="w-2.5 h-2.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-relaxed">{c.note}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Risk & Recommendation */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <Card className="p-4 border border-slate-200/80 shadow-sm rounded-xl">
            <h3 className="font-semibold text-slate-800 text-sm mb-2.5">Identifikasi Risiko</h3>
            <div className="space-y-2">
              {[
                { level: "low", label: "Risiko Angin", desc: "Kecepatan angin konsisten. Risiko penurunan < 5% per dekade.", color: "emerald" },
                { level: "medium", label: "Risiko Jaringan", desc: "Kapasitas interkoneksi perlu dikonfirmasi PLN. Lead time 18 bulan.", color: "amber" },
                { level: "medium", label: "Risiko Lahan", desc: "Perlu penyelesaian HGU 15% area. Risiko keterlambatan konstruksi.", color: "amber" },
                { level: "low", label: "Risiko Lingkungan", desc: "AMDAL sebentar lagi terbit. Tidak ada kawasan kritis teridentifikasi.", color: "emerald" },
                { level: "low", label: "Risiko Regulasi", desc: "Dukungan Pemda kuat. Masuk prioritas RUPTL 2025-2034.", color: "emerald" },
              ].map((r, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                  r.color === "emerald" ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"
                }`}>
                  {r.level === "low" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-[11px] font-bold ${r.color === "emerald" ? "text-emerald-700" : "text-amber-700"}`}>
                      {r.label} — {r.level === "low" ? "Rendah" : "Menengah"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border border-slate-200/80 shadow-sm rounded-xl">
            <h3 className="font-semibold text-slate-800 text-sm mb-2.5">Rekomendasi Tindak Lanjut</h3>
            <div className="space-y-2">
              {[
                { phase: "Fase 1 — 0-6 Bulan", steps: ["Pengajuan IRB (Investment Registration Board)", "Pemasangan met mast 60m & 100m", "Studi AMDAL rinci", "Negosiasi lahan HGU"], icon: "1", color: "blue" },
                { phase: "Fase 2 — 6-18 Bulan", steps: ["Front-End Engineering Design (FEED)", "Studi koneksi grid PLN", "Financial Close & EPC tender", "Perizinan konstruksi"], icon: "2", color: "cyan" },
                { phase: "Fase 3 — 18-36 Bulan", steps: ["Konstruksi fondasi & infrastruktur", "Pengiriman & erection turbin", "Commissioning & testing", "COD (Commercial Operation Date)"], icon: "3", color: "green" },
              ].map((p, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  p.color === "blue" ? "border-blue-200 bg-blue-50/50" :
                  p.color === "cyan" ? "border-cyan-200 bg-cyan-50/50" :
                  "border-emerald-200 bg-emerald-50/50"
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                      p.color === "blue" ? "bg-blue-500" :
                      p.color === "cyan" ? "bg-cyan-500" : "bg-emerald-500"
                    }`}>{p.icon}</div>
                    <p className="text-xs font-bold text-slate-700">{p.phase}</p>
                  </div>
                  <ul className="space-y-0.5">
                    {p.steps.map((s, j) => (
                      <li key={j} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
    </RequireAuth>
  );
}
