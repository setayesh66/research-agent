const API_BASE_URL = "http://127.0.0.1:8000";

export type ChatResponse = {
  reply: string;
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

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}