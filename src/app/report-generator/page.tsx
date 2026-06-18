"use client";

import MainLayout from "@/components/layout/MainLayout";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send, Bot, User, Copy, Download, FileText, Sparkles,
  Zap, Wind, BarChart2, CheckCircle2,
  RefreshCw, TrendingUp, MessageSquare, History, Trash2, Plus
} from "lucide-react";
import {
  getCurrentUserId,
  createChatSession,
  getChatSessions,
  getChatMessages,
  addChatMessage,
  updateSessionTitle,
  deleteChatSession,
  type ChatSession,
} from "@/lib/supabase/chatHistory";

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
  { label: "Analisis Kelayakan",    prompt: "Analisis kelayakan pembangunan PLTB di daerah ini", icon: CheckCircle2 },
  { label: "Estimasi Energi",       prompt: "Berapa estimasi produksi energi tahunan?",           icon: Zap },
  { label: "Kelebihan & Kekurangan", prompt: "Apa kelebihan dan kekurangan lokasi ini?",          icon: TrendingUp },
  { label: "Rekomendasi Turbin",    prompt: "Rekomendasikan tipe turbin terbaik untuk lokasi ini", icon: Wind },
  { label: "Ringkasan Eksekutif",   prompt: "Buat ringkasan eksekutif kelayakan PLTB",            icon: FileText },
  { label: "Analisis Risiko",       prompt: "Jelaskan risiko utama pembangunan PLTB di lokasi ini", icon: BarChart2 },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Halo! Saya **Nestra Assistant** 👋\n\nSaya siap membantu Anda menganalisis potensi PLTB di seluruh lokasi dan menghasilkan laporan kelayakan komprehensif.\n\nCoba tanyakan:\n- "Analisis kelayakan pembangunan PLTB di lokasi tertentu"\n- "Berapa estimasi produksi energi tahunan?"\n- "Apa kelebihan dan kekurangan lokasinya?"`,
  timestamp: new Date(),
};

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

  const sources =
    data.sources?.length
      ? `\n\n*Sumber: ${data.sources.join(", ")}*`
      : "";
  return (data.answer ?? "Tidak ada jawaban.") + sources;
}

// ─── Markdown renderer ───────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-sm font-bold text-slate-800 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-700">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-1.5 text-slate-600 text-xs"><span class="text-blue-400 mt-0.5">•</span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>');
}

// ─── Format tanggal ──────────────────────────────────────────────────────────
function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hari ini, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) {
    return `Kemarin, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportGeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef        = useRef<HTMLDivElement>(null);

  // ─── Supabase state ──────────────────────────────────────────────────────
  const [userId, setUserId]                 = useState<string | null>(null);
  const [sessions, setSessions]             = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // ─── Load user & sessions on mount ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      const uid = await getCurrentUserId();
      setUserId(uid);
      if (uid) {
        const s = await getChatSessions(uid);
        setSessions(s);
      }
      setSessionsLoading(false);
    })();
  }, []);

  // ─── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Refresh sessions list ──────────────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    if (!userId) return;
    const s = await getChatSessions(userId);
    setSessions(s);
  }, [userId]);

  // ─── Load a session ─────────────────────────────────────────────────────
  const loadSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setError(null);

    const dbMessages = await getChatMessages(sessionId);
    if (dbMessages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }

    setMessages(
      dbMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      }))
    );
  }, []);

  // ─── Start a new chat ──────────────────────────────────────────────────
  const startNewChat = useCallback(async () => {
    setActiveSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setInput("");
  }, []);

  // ─── Delete a session ──────────────────────────────────────────────────
  const handleDeleteSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChatSession(sessionId);
    if (activeSessionId === sessionId) {
      startNewChat();
    }
    await refreshSessions();
  }, [activeSessionId, startNewChat, refreshSessions]);

  // ─── Send message ──────────────────────────────────────────────────────
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

    // ── Ensure we have a session ────────────────────────────────────────
    let currentSessionId = activeSessionId;
    if (!currentSessionId && userId) {
      const session = await createChatSession(userId, prompt.slice(0, 50));
      if (session) {
        currentSessionId = session.id;
        setActiveSessionId(session.id);
      }
    }

    // ── Save user message to DB ─────────────────────────────────────────
    if (currentSessionId) {
      await addChatMessage(currentSessionId, "user", prompt);

      // Auto-title from first user message (if session just created, title is already set)
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (currentSession?.title === "Chat Baru") {
        await updateSessionTitle(currentSessionId, prompt);
      }
    }

    // Show typing indicator
    setMessages((prev) => [
      ...prev,
      { id: "typing", role: "assistant", content: "...", timestamp: new Date(), isTyping: true },
    ]);

    try {
      const response = await fetchAIResponse(prompt);

      // Save assistant response to DB
      if (currentSessionId) {
        await addChatMessage(currentSessionId, "assistant", response);
      }

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

      // Refresh sidebar
      await refreshSessions();
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
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold gradient-text">Nestra AI</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Asisten AI interaktif untuk analisis kelayakan &amp; prediksi potensi PLTB berbasis ML
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {/* ════════════════════════════════════════════════════
             MAIN CHAT AREA — Expanded
             ════════════════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 glass-card overflow-hidden flex flex-col rounded-xl"
              style={{ minHeight: "calc(100vh - 150px)", maxHeight: "calc(100vh - 150px)" }}>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 custom-scrollbar" ref={chatContainerRef}>
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg) => (
                    <div key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

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
                            <div className="flex gap-1.5 items-center py-1">
                              {[0, 150, 300].map((delay) => (
                                <div key={delay} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
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
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
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
                    {EXAMPLE_PROMPTS.map((p) => (
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
                <div className="flex gap-2 items-end max-w-4xl mx-auto">
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

          {/* ════════════════════════════════════════════════════
             RIGHT SIDEBAR — Chat History (from Supabase)
             ════════════════════════════════════════════════════ */}
          <div className="w-72 flex-shrink-0 hidden xl:flex flex-col gap-3">
            <Card className="p-4 glass-card rounded-xl flex-1 flex flex-col min-h-0 border-slate-200/60"
              style={{ maxHeight: "calc(100vh - 150px)" }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">Riwayat Chat</h3>
              </div>

              <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {sessionsLoading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg">
                        <div className="h-3.5 w-3/4 skeleton rounded mb-2" />
                        <div className="h-2.5 w-1/2 skeleton rounded" />
                      </div>
                    ))}
                  </>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                    <p className="text-[11px] text-slate-400">Belum ada riwayat chat</p>
                    <p className="text-[9px] text-slate-300 mt-1">Mulai chat baru untuk memulai</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`group/item p-3 rounded-lg cursor-pointer transition-all duration-150 border ${
                        activeSessionId === session.id
                          ? "bg-blue-50/80 border-blue-200 shadow-sm"
                          : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-[11px] font-medium truncate flex-1 ${
                          activeSessionId === session.id ? "text-blue-700" : "text-slate-600"
                        }`}>
                          {session.title}
                        </p>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all flex-shrink-0"
                          title="Hapus"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className={`text-[9px] mt-1 ${
                        activeSessionId === session.id ? "text-blue-400" : "text-slate-400"
                      }`}>
                        {formatSessionDate(session.updated_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs h-8 text-white"
                  onClick={startNewChat}
                  id="btn-new-chat-sidebar">
                  <MessageSquare className="w-3 h-3" /> Chat Baru
                </Button>
                <Button variant="outline" className="w-full text-xs h-8 text-slate-500 gap-1.5"
                  id="btn-export-pdf-sidebar">
                  <Download className="w-3 h-3" /> Export PDF
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
