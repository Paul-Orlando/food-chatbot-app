"use client";

import { CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  orderNumber: string;
  onStartNew: () => void;
  className?: string;
}

export function OrderConfirmed({ orderNumber, onStartNew, className }: Props) {
  return (
    <aside className={cn("hidden lg:flex w-64 flex-col border-l border-cream-300 bg-[#fffdf9]", className)}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-cream-300 bg-olive-700 text-white shrink-0">
        <p className="font-serif font-bold text-sm">Order Placed</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>

        <h2 className="font-serif text-xl font-bold text-stone-800 mb-1">
          Order Confirmed!
        </h2>

        <div className="bg-olive-50 border border-olive-200 rounded-xl px-4 py-2 mb-4">
          <p className="text-xs text-olive-600 font-medium">Order number</p>
          <p className="text-lg font-bold text-olive-800 font-mono">{orderNumber}</p>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-1">
          Thank you for your order!
        </p>
        <p className="text-sm text-stone-500 leading-relaxed mb-8">
          Your food will be ready soon.
        </p>

        <button
          onClick={onStartNew}
          className="flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw size={14} />
          Start New Order
        </button>
      </div>
    </aside>
  );
}
