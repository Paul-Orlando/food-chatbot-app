import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  count: number;
  className?: string;
}

export function ChunkBadge({ count, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-olive-600 bg-olive-50 border border-olive-200 px-2 py-0.5 rounded-full",
        className
      )}
      title="Number of menu sections retrieved from the knowledge base"
    >
      <Database size={10} />
      {count} chunk{count !== 1 ? "s" : ""} retrieved
    </span>
  );
}
