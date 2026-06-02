import type { OrderEntry } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function streamChat(
  sessionId: string,
  message: string,
  onToken: (content: string) => void,
  onChunks: (count: number) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
  } catch {
    onError("Cannot reach the server. Is the backend running?");
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    onError(`Server error ${response.status}: ${text}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("No response stream available.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") {
          onDone();
          return;
        }
        try {
          const event = JSON.parse(raw) as { type: string; content?: string; count?: number };
          if (event.type === "token" && event.content !== undefined) {
            onToken(event.content);
          } else if (event.type === "chunks" && event.count !== undefined) {
            onChunks(event.count);
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  onDone();
}

export async function getOrder(sessionId: string): Promise<OrderEntry[]> {
  try {
    const res = await fetch(`${API_URL}/session/${sessionId}/order`);
    if (!res.ok) return [];
    const data = (await res.json()) as { orders: OrderEntry[] };
    return data.orders ?? [];
  } catch {
    return [];
  }
}

export async function confirmOrder(
  sessionId: string,
  items: Array<{ name: string; price: number; quantity: number }>
): Promise<{ confirmation: string; orderNumber: string }> {
  const res = await fetch(`${API_URL}/confirm-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, items }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Order failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { confirmation: string; order_number: string };
  return { confirmation: data.confirmation, orderNumber: data.order_number };
}

export async function clearSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/session/${sessionId}`, { method: "DELETE" });
  } catch {
    // best-effort
  }
}
