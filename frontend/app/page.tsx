"use client";

import { useEffect, useRef, useState } from "react";
import { CloudSceneLoader } from "@/components/Hero/CloudSceneLoader";
import { sendChatMessage, getConversations, getConversationMessages } from "@/lib/api";
import type { Message, ConversationSummary } from "@/lib/api";

type Phase = "landing" | "chat";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Effect 1: on first mount, load an existing session id from localStorage,
  // or create + store a new one. Runs once ([] dependency array).
  useEffect(() => {
    const stored = localStorage.getItem("haloforge_sessionID");
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("haloforge_sessionID", newId);
      setSessionId(newId);
    }
  }, []);

  //effect2
useEffect(() => {
  if (!sessionId) return;

  async function restore() {
    try {
      const history = await getConversationMessages(sessionId);
      if (history.length > 0) {
        setMessages(history);
        setPhase("chat");
      }
    } catch (err) {
      console.error("Failed to restore conversation:", err);
    }
  }

  restore();
}, [sessionId]);

  // Effect 3: whenever the history panel opens, fetch the list of
  useEffect(() => {
    if (!historyOpen) return;

    getConversations()
      .then(setConversations)
      .catch((err) => console.error("Failed to load history:", err));
  }, [historyOpen]);

  // Effect 4: auto-scroll to the newest message whenever messages change
  // or the "Thinking…" bubble appears.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  function handleNewChat() {
    const freshId = crypto.randomUUID();
    localStorage.setItem("haloforge_sessionID", freshId);
    setSessionId(freshId);
    setMessages([]);
    setPhase("landing");
    setHistoryOpen(false);
  }

  async function handleSelectConversation(id: string) {
    localStorage.setItem("haloforge_sessionID", id);
    setSessionId(id);
    try {
      const history = await getConversationMessages(id);
      setMessages(history);
      setPhase("chat");
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
    setHistoryOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    if (phase === "landing") setPhase("chat");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const { reply } = await sendChatMessage(userMessage, sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setError("Couldn't reach HaloForge. Is the backend running?");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="relative isolate h-screen w-full overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setHistoryOpen(true)}
          className="rounded-full bg-white/70 px-4 py-2 text-sm text-slate-600 shadow backdrop-blur hover:bg-white"
        >
          History
        </button>
        <button
          onClick={handleNewChat}
          className="rounded-full bg-white/70 px-4 py-2 text-sm text-slate-600 shadow backdrop-blur hover:bg-white"
        >
          + New chat
        </button>
      </div>

      {/* History panel */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur shadow-xl transition-transform duration-300 ${
          historyOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sky-100 px-4 py-4">
          <span className="font-medium text-slate-700">Chat history</span>
          <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto p-2">
          {conversations.length === 0 && (
            <p className="p-3 text-sm text-slate-400">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectConversation(c.id)}
              className="rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-sky-50"
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* click-outside backdrop */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => setHistoryOpen(false)}
        />
      )}

      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/50 blur-3xl" />

      {/* Fog at the bottom of the page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-sky-200/80 via-sky-100/40 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />

      {/* 3D scene — always mounted, just animates via `docked` */}
      <div className="absolute inset-0 z-0">
        <CloudSceneLoader docked={phase === "chat"} />
      </div>

      {/* LANDING overlay: headline, fades out once we move to chat */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-700 ${
          phase === "landing" ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="mb-2 text-4xl font-semibold text-slate-700">HaloForge</h1>
        <p className="text-slate-500">Cloud infrastructure, simplified.</p>
      </div>

      {/* CHAT overlay: messages, fades in once docked */}
      <div
        ref={scrollRef}
        className={`absolute inset-x-0 top-24 bottom-24 z-20 mx-auto max-w-xl overflow-y-auto no-scrollbar px-4 transition-opacity duration-700 ${
          phase === "chat" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "self-end bg-sky-500 text-white"
                  : "self-start bg-white text-slate-700 shadow"
              }`}
            >
              {m.content}
            </div>
          ))}

          {isSending && (
            <div className="self-start rounded-2xl bg-white px-4 py-2 text-sm text-slate-400 shadow">
              Thinking…
            </div>
          )}
          {error && (
            <div className="self-start rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-500 shadow">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={`absolute z-20 w-full max-w-xl px-4 left-1/2 -translate-x-1/2 transition-all duration-700 ${
          phase === "landing" ? "bottom-16" : "bottom-6"
        }`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HaloForge anything..."
          className="w-full rounded-full border border-sky-200 bg-white/90 px-5 py-3 text-slate-700 shadow-lg outline-none focus:border-sky-400"
        />
      </form>
    </main>
  );
}