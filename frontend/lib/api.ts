const API_BASE_URL = "http://127.0.0.1:8000";

export type ChatResponse = {
  reply: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
};

export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_BASE_URL}/conversations`);

  if (!res.ok) {
    throw new Error(`Failed to fetch conversations: ${res.status}`);
  }

  return res.json();
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);

  if (!res.ok) {
    throw new Error(`Failed to fetch messages: ${res.status}`);
  }

  return res.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}


export async function streamChatMessage(
  message: string,
  sessionId: string,
  onToken: (token: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line ("\n\n")
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? ""; // keep any incomplete trailing chunk for next read

    for (const event of events) {
      if (!event.startsWith("data: ")) continue;
      const payload = JSON.parse(event.slice(6));
      if (payload.token) onToken(payload.token);
      if (payload.done) return;
    }
  }
}