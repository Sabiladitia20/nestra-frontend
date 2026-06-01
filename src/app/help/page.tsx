"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Compass, 
  FileText, 
  Cpu, 
  ChevronDown, 
  Search, 
  Lightbulb,
  ExternalLink 
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Bagaimana Feasibility Score (Skor Kelayakan) dihitung?",
      a: "Feasibility Score (0-100) dihitung secara algoritmik berdasarkan 5 parameter utama: (1) Rata-rata kecepatan angin tahunan [bobot 40%], (2) Konsistensi arah angin (wind rose distribution) [bobot 20%], (3) Elevasi dan topografi lokasi [bobot 15%], (4) Kedekatan dengan jaringan transmisi listrik (grid accessibility) [bobot 15%], dan (5) Batasan regulasi lingkungan/kawasan lindung [bobot 10%]."
    },
    {
      q: "Apa perbedaan antara model prediksi (RF, SVR, CNN, Transformer)?",
      a: "Random Forest (RF) adalah model berbasis ensemble decision trees yang sangat stabil untuk data spasial tabular. SVR (Support Vector Regression) baik untuk hubungan non-linear sederhana. CNN (Convolutional Neural Network) mengekstrak fitur pola temporal/spasial dalam matriks deret waktu cuaca. Transformer adalah arsitektur deep learning termodern yang memanfaatkan self-attention untuk menangkap dependensi jangka panjang pada deret waktu kecepatan angin."
    },
    {
      q: "Mengapa diagram Wind Rose sangat penting untuk analisis PLTB?",
      a: "Wind Rose menunjukkan distribusi frekuensi arah datangnya angin dan kecepatan angin dari arah tersebut. Informasi ini krusial untuk menentukan orientasi arah hadap turbin angin (wind turbine micro-siting) guna meminimalkan efek wake (turbulensi di belakang turbin lain) dan memaksimalkan efisiensi penangkapan energi angin."
    },
    {
      q: "Bagaimana cara melakukan ekspor laporan analisis?",
      a: "Anda dapat masuk ke halaman Nestra AI (Report Generator) untuk mengunduh laporan PDF komprehensif, atau menggunakan tombol ekspor data CSV di tabel dataset halaman Data Analysis. Nestra AI juga dapat menyusun narasi ringkasan rekomendasi dalam bahasa Indonesia secara otomatis untuk Anda."
    },
    {
      q: "Berapa kapasitas turbin angin default yang digunakan untuk estimasi daya?",
      a: "Secara default, dashboard Nestra AI menggunakan pemodelan turbin angin kelas utilitas 2.0 MW dengan tinggi hub 80 meter, cut-in speed 3.5 m/s, dan cut-out speed 25.0 m/s. Anda dapat menyesuaikan koefisien efisiensi turbin dan parameter density udara di halaman Settings."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-5 max-w-5xl mx-auto stagger-in">
        {/* Header Help Card */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-300" />
                <h1 className="text-base font-extrabold tracking-tight">Pusat Bantuan & Dokumentasi</h1>
              </div>
              <p className="text-xs text-blue-100 max-w-xl">
                Temukan panduan teknis, jawaban FAQ, dan cara mengoptimalkan analisis potensi energi angin PLTB menggunakan platform Nestra AI.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Cari bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border-0 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
              />
              <Search className="w-3.5 h-3.5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Quick Guides */}
          <div className="lg:col-span-2 space-y-4">
            {/* FAQ Sections */}
            <Card className="p-5 glass-card rounded-xl border border-slate-200/60 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> Pertanyaan Sering Diajukan (FAQ)
              </h2>

              <div className="space-y-2">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div 
                        key={idx} 
                        className="border border-slate-100 rounded-lg overflow-hidden bg-white/40 hover:bg-white/60 transition-colors"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-700 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="p-3.5 pt-0 border-t border-slate-50 text-[11px] text-slate-500 leading-relaxed bg-slate-50/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Tidak ditemukan FAQ pencocokan "{searchQuery}"
                  </div>
                )}
              </div>
            </Card>

            {/* Quick documentation links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-4 glass-card rounded-xl hover:shadow-md transition-all duration-200 border border-slate-200/50">
                <Compass className="w-5 h-5 text-blue-500 mb-2" />
                <h3 className="text-xs font-bold text-slate-800 mb-1">Panduan Arah & Siting</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Pelajari tata cara optimasi mikro-siting menggunakan koordinat geografis dan arah angin dominan.</p>
                <Button variant="link" className="p-0 h-auto text-[10px] text-blue-600 gap-1 font-bold">
                  Buka Panduan <ExternalLink className="w-3 h-3" />
                </Button>
              </Card>

              <Card className="p-4 glass-card rounded-xl hover:shadow-md transition-all duration-200 border border-slate-200/50">
                <Cpu className="w-5 h-5 text-cyan-500 mb-2" />
                <h3 className="text-xs font-bold text-slate-800 mb-1">Model & Metrik Evaluasi</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Penjelasan lengkap tentang metrik RMSE, MAE, R², dan parameter pembelajaran model temporal AI.</p>
                <Button variant="link" className="p-0 h-auto text-[10px] text-cyan-600 gap-1 font-bold">
                  Buka Dokumentasi <ExternalLink className="w-3 h-3" />
                </Button>
              </Card>
            </div>
          </div>

          {/* Right Column: Contact & Support */}
          <div className="space-y-4">
            <Card className="p-5 glass-card rounded-xl border border-slate-200/60 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Hubungi Dukungan
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Butuh bantuan lebih lanjut tentang integrasi data NASA POWER, deployment model ML kustom Anda, atau lisensi enterprise? Tim ahli kami siap membantu.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Kirim Email</p>
                    <a href="mailto:support@nestra.ai" className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors">support@nestra.ai</a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Sistem Tiket</p>
                    <span className="text-xs font-bold text-slate-700">helpdesk.nestra.ai</span>
                  </div>
                </div>
              </div>

              <Button className="w-full text-xs font-semibold h-9 bg-blue-600 hover:bg-blue-700 text-white">
                Buat Tiket Baru
              </Button>
            </Card>

            <Card className="p-4 bg-yellow-50/50 border border-yellow-200/60 rounded-xl flex gap-2.5">
              <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Tips Nestra AI:</span> Anda dapat langsung mengetikkan pertanyaan tentang dataset atau turbin di tab <b>Nestra AI (Report Generator)</b> untuk konsultasi interaktif otomatis!
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
