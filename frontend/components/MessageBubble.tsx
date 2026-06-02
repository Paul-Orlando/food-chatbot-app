import { ChunkBadge } from "./ChunkBadge";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface Props {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-end gap-3 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1",
          isUser ? "bg-terracotta-600" : "bg-olive-600"
        )}
      >
        {isUser ? "You" : "BV"}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[75%] flex flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-olive-700 text-white rounded-br-sm"
              : "bg-cream-100 border border-cream-300 text-stone-800 rounded-bl-sm"
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
          )}
        </div>

        <div className={cn("flex items-center gap-2 px-1", isUser && "flex-row-reverse")}>
          <span className="text-xs text-stone-400">{formatTime(message.timestamp)}</span>
          {message.chunkCount !== undefined && (
            <ChunkBadge count={message.chunkCount} />
          )}
        </div>
      </div>
    </div>
  );
}
