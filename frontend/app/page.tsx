"use client";

import { useState } from "react";
import { sendChatMessage } from "@/lib/api";

type Message = {
  role: "user" | "agent";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(userMessage.content, sessionId);
      const agentMessage: Message = { role: "agent", content: data.reply };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Error: could not reach the agent." },
      ]);
    } finally {
      setLoading(false);
    }
      }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Haloforge Support Agent</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              m.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-black mr-auto"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Agent is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border bg-white rounded-lg px-3 py-2 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about the Haloforge API..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}