"use client";

import MainLayout from "@/components/layout/MainLayout";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send, Bot, User, Copy, Download, FileText, Sparkles,
  ChevronRight, Zap, Wind, BarChart2, MapPin, CheckCircle2,
  RefreshCw, Database, TrendingUp,
} from "lucide-react";
import { locationData, kpiData } from "@/lib/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QueryResponse {
  type: "answer" | "recommendation" | "unknown";
  answer?: string;
  recommendation?: string;
  requirements?: string;
  candidates?: { id: string; model: string; manufacturer: string }[];
  sources?: string[];
  elapsed?: number;
}

const BACKEND_URL = "/api/chat";

const EXAMPLE_PROMPTS = [
  { label: "Analisis Kelayakan",   prompt: "Analisis kelayakan pembangunan PLTB di daerah ini", icon: CheckCircle2 },
  { label: "Estimasi Energi",      prompt: "Berapa estimasi produksi energi tahunan?",           icon: Zap },
  { label: "Kelebihan & Kekurangan", prompt: "Apa kelebihan dan kekurangan lokasi ini?",         icon: TrendingUp },
  { label: "Rekomendasi Turbin",   prompt: "Rekomendasikan tipe turbin terbaik untuk lokasi ini", icon: Wind },
  { label: "Ringkasan Eksekutif",  prompt: "Buat ringkasan eksekutif kelayakan PLTB", icon: FileText },
  { label: "Analisis Risiko",      prompt: "Jelaskan risiko utama pembangunan PLTB di lokasi ini", icon: BarChart2 },
];

// ─── API call ────────────────────────────────────────────────────────────────
async function fetchAIResponse(question: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, verbose: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? `Server error ${res.status}`);
  }

  const data: QueryResponse = await res.json();

  // ── normalise every response shape into a single markdown string ──
  if (data.type === "recommendation") {
    const candidates =
      data.candidates
        ?.map((c) => `- **${c.model}** — ${c.manufacturer} (ID: ${c.id})`)
        .join("\n") ?? "";
    return [
      `**Kebutuhan:** ${data.requirements ?? "-"}`,
      "",
      `**Rekomendasi:**\n${data.recommendation ?? "-"}`,
      "",
      candidates ? `**Kandidat Turbin:**\n${candidates}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (data.type === "unknown") {
    return data.answer ?? "Pertanyaan tidak dikenali. Silakan tanya tentang turbin angin.";
  }

  // type === "answer"
  const sources =
    data.sources?.length
      ? `\n\n*Sumber: ${data.sources.join(", ")}*`
      : "";
  return (data.answer ?? "Tidak ada jawaban.") + sources;
}

// ─── Markdown renderer (unchanged) ───────────────────────────────────────────
function renderMarkdown(text: string) {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-sm font-bold text-slate-800 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-700">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-1.5 text-slate-600 text-xs"><span class="text-blue-400 mt-0.5">•</span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>');
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportGeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya **Nestra Assistant** 👋\n\nSaya siap membantu Anda menganalisis potensi PLTB di seluruh lokasi dan menghasilkan laporan kelayakan komprehensif.\n\nCoba tanyakan:\n- "Analisis kelayakan pembangunan PLTB di lokasi tertentu"\n- "Berapa estimasi produksi energi tahunan?"\n- "Apa kelebihan dan kekurangan lokasinya?"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const prompt = text ?? input.trim();
    if (!prompt || isLoading) return;

    setError(null);

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Show typing indicator
    setMessages((prev) => [
      ...prev,
      { id: "typing", role: "assistant", content: "...", timestamp: new Date(), isTyping: true },
    ]);

    try {
      const response = await fetchAIResponse(prompt);
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "typing")
          .concat({
            id: Date.now().toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          })
      );
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));
      setError(err.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (text: string) => navigator.clipboard.writeText(text);

  return (
    
    <MainLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold gradient-text">Nestra AI</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Asisten AI interaktif untuk analisis kelayakan &amp; prediksi potensi PLTB berbasis ML
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" id="btn-new-chat"
              onClick={() => {
                setMessages([{ id: "welcome", role: "assistant", content: "Chat baru dimulai. Silakan ajukan pertanyaan.", timestamp: new Date() }]);
                setError(null);
              }}>
              <RefreshCw className="w-3 h-3" /> Chat Baru
            </Button>
            <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 h-8" id="btn-generate-report">
              <FileText className="w-3 h-3" /> Generate PDF
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 glass-card overflow-hidden flex flex-col rounded-xl"
              style={{ minHeight: "calc(100vh - 240px)", maxHeight: "calc(100vh - 240px)" }}>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0 custom-scrollbar" ref={chatContainerRef}>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id}
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === "assistant" ? "bg-blue-600 shadow-sm" : "bg-slate-200"}`}>
                        {msg.role === "assistant"
                          ? <Bot className="w-3.5 h-3.5 text-white" />
                          : <User className="w-3.5 h-3.5 text-slate-600" />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[80%] group ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                        <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-600 rounded-tl-sm shadow-sm"}`}>
                          {msg.isTyping ? (
                            <div className="flex gap-1 items-center py-1">
                              {[0, 150, 300].map((delay) => (
                                <div key={delay} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                                  style={{ animationDelay: `${delay}ms` }} />
                              ))}
                            </div>
                          ) : msg.role === "assistant" ? (
                            <div className="prose-sm text-xs"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                          ) : (
                            <span className="text-xs">{msg.content}</span>
                          )}
                        </div>

                        {/* Actions */}
                        {!msg.isTyping && msg.role === "assistant" && (
                          <div className="flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyMessage(msg.content)}
                              className="flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-blue-500 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50"
                              id={`btn-copy-${msg.id}`}>
                              <Copy className="w-2.5 h-2.5" /> Salin
                            </button>
                            <button className="flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-blue-500 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50"
                              id={`btn-export-${msg.id}`}>
                              <Download className="w-2.5 h-2.5" /> Export
                            </button>
                          </div>
                        )}

                        <p className="text-[9px] text-slate-300 mt-0.5">
                          {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Error banner */}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                      <span>⚠️ {error}</span>
                      <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Example Prompts */}
              {messages.length <= 1 && (
                <div className="border-t border-slate-100 p-2.5">
                  <p className="text-[9px] text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Contoh pertanyaan:</p>
                  <div className="flex flex-wrap gap-1">
                    {EXAMPLE_PROMPTS.slice(0, 4).map((p) => (
                      <button key={p.prompt} onClick={() => sendMessage(p.prompt)}
                        className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-2.5 py-0.5 transition-colors"
                        id={`prompt-${p.label.toLowerCase().replace(/\s/g, "-")}`}>
                        <p.icon className="w-2.5 h-2.5" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-slate-100 p-2.5">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <textarea ref={inputRef} value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ketik pertanyaan tentang analisis PLTB..."
                      rows={2}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
                      id="chat-input"
                      disabled={isLoading}
                    />
                    <Sparkles className="absolute top-2 right-2.5 w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                    className="h-[56px] w-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex-shrink-0"
                    id="btn-send">
                    {isLoading
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-[9px] text-slate-300 mt-1 text-center">
                  Shift+Enter untuk baris baru · Nestra v1.0
                </p>
              </div>
            </Card>
          </div>

          {/* Right Sidebar — unchanged */}
          <div className="w-56 flex-shrink-0 hidden xl:flex flex-col gap-2.5">
            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-800">Dataset Aktif</h3>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-400">Lokasi</p>
                    <p className="text-[11px] font-semibold text-slate-700 leading-tight">Seluruh Lokasi</p>
                  </div>
                </div>
                {[
                  { label: "Periode",  value: "Jan 2013 – Des 2025" },
                  { label: "Records",  value: "113,880 jam" },
                  { label: "Sumber",   value: "NASA" },
                  { label: "Kualitas", value: "99.5% valid" },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{d.label}</span>
                    <span className="text-slate-700 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-800">Hasil Prediksi</h3>
              </div>
              <div className="space-y-2">
                {kpiData.map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 leading-none">{kpi.label}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {kpi.value} <span className="text-[10px] font-normal text-slate-400">{kpi.unit}</span>
                      </p>
                    </div>
                    <Badge className={`text-[8px] border-0 ${
                      kpi.id === "feasibility" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                      ↑
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-1.5 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-800">Template Laporan</h3>
              </div>
              <div className="space-y-0.5">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button key={p.prompt} onClick={() => sendMessage(p.prompt)}
                    className="w-full flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-blue-50 text-[11px] text-slate-500 hover:text-blue-700 transition-colors group"
                    id={`sidebar-prompt-${p.label.toLowerCase().replace(/\s/g, "-")}`}>
                    <p.icon className="w-3 h-3 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                    <span className="leading-tight">{p.label}</span>
                    <ChevronRight className="w-2.5 h-2.5 ml-auto text-slate-300 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-1.5">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs h-8" id="btn-generate-full-report">
                <FileText className="w-3 h-3" /> Full Report
              </Button>
              <Button variant="outline" className="w-full gap-1.5 text-xs h-8" id="btn-copy-all">
                <Copy className="w-3 h-3" /> Salin Chat
              </Button>
              <Button variant="outline" className="w-full gap-1.5 text-xs h-8" id="btn-export-pdf">
                <Download className="w-3 h-3" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
    
  );
}
