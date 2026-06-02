"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { streamChat, clearSession } from "@/lib/api";
import type { Message } from "@/lib/types";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return uuidv4();
  let id = sessionStorage.getItem("bella_vista_session");
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem("bella_vista_session", id);
  }
  return id;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState<string>(getOrCreateSessionId);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const botMsgId = uuidv4();
      const botMsg: Message = {
        id: botMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setIsStreaming(true);

      await streamChat(
        sessionId,
        content.trim(),
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: m.content + token } : m
            )
          );
        },
        (count) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, chunkCount: count } : m
            )
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, isStreaming: false } : m
            )
          );
          setIsStreaming(false);
        },
        (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, content: error, isStreaming: false }
                : m
            )
          );
          setIsStreaming(false);
        }
      );
    },
    [sessionId, isStreaming]
  );

  const appendBotMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "assistant" as const,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const clearChat = useCallback(async () => {
    await clearSession(sessionId);
    sessionStorage.removeItem("bella_vista_session");
    window.location.reload();
  }, [sessionId]);

  return { messages, isStreaming, sessionId, sendMessage, appendBotMessage, clearChat };
}
