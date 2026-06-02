export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-olive-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        BV
      </div>
      <div className="bg-cream-100 border border-cream-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-olive-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-olive-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-olive-400 inline-block" />
        </div>
      </div>
    </div>
  );
}
