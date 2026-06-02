"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Send, Trash2, Menu, ShoppingCart } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

const SUGGESTED = [
  "What vegetarian options do you have?",
  "What's gluten free?",
  "What are your pasta dishes?",
  "Show me the dessert menu",
];

interface Props {
  messages: Message[];
  isStreaming: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (message: string) => void;
  onClear: () => void;
  onMenuOpen: () => void;
  cartCount: number;
  onCartOpen: () => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  inputValue,
  cartCount,
  onCartOpen,
  onInputChange,
  onSend,
  onClear,
  onMenuOpen,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = () => {
    const val = inputValue.trim();
    if (!val || isStreaming) return;
    onSend(val);
    onInputChange("");
    setRows(1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    const lineCount = e.target.value.split("\n").length;
    setRows(Math.min(lineCount, 4));
  };

  const showSuggestions = messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-cream-300 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="lg:hidden p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-stone-600" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-lg text-stone-800 leading-tight">
              Bella Vista
            </h1>
            <p className="text-xs text-olive-600 font-medium">Italian Restaurant · Order Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Cart button — hidden on lg+ where the cart panel is always visible */}
          <button
            onClick={onCartOpen}
            title="View cart"
            className="relative lg:hidden flex items-center gap-1 text-xs text-olive-700 hover:text-olive-800 font-medium px-2 py-1.5 rounded-lg hover:bg-olive-50 transition-colors"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-terracotta-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            onClick={onClear}
            title="Clear conversation"
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🍝</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-800 mb-2">
              Benvenuti!
            </h2>
            <p className="text-sm text-stone-500 mb-6 max-w-xs">
              I can help you explore our menu, find dishes for dietary needs, and place your order.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          // Suppress empty streaming bot messages — TypingIndicator handles that state
          if (msg.role === "assistant" && msg.isStreaming && !msg.content) return null;
          return <MessageBubble key={msg.id} message={msg} />;
        })}

        {isStreaming &&
          messages[messages.length - 1]?.role === "assistant" &&
          !messages[messages.length - 1]?.content && (
            <TypingIndicator />
          )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="px-4 pb-3 shrink-0">
          <p className="text-xs text-stone-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => onSend(q)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border",
                  "border-olive-300 text-olive-700 bg-olive-50",
                  "hover:bg-olive-100 hover:border-olive-400 transition-colors"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-cream-300 bg-white shrink-0">
        <div className="flex items-end gap-2 bg-cream-50 border border-cream-300 rounded-2xl px-3 py-2 focus-within:border-olive-400 focus-within:ring-2 focus-within:ring-olive-100 transition-all">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={rows}
            placeholder="Ask about the menu or place an order…"
            disabled={isStreaming}
            className={cn(
              "flex-1 bg-transparent resize-none text-sm text-stone-800 placeholder-stone-400",
              "focus:outline-none leading-relaxed py-1",
              isStreaming && "opacity-60 cursor-not-allowed"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className={cn(
              "mb-0.5 p-2 rounded-xl transition-all",
              inputValue.trim() && !isStreaming
                ? "bg-olive-700 text-white hover:bg-olive-800 shadow-sm"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-stone-300 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
