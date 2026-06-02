"use client";

import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { cartSubtotal, cartTax, cartTotal, type CartItem } from "@/lib/cart";

interface Props {
  items: CartItem[];
  isConfirming: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => void;
  className?: string;
}

function Row({ label, value, bold, divider }: { label: string; value: number; bold?: boolean; divider?: boolean }) {
  return (
    <>
      {divider && <div className="border-t border-cream-300 my-1" />}
      <div className={cn("flex justify-between text-sm", bold ? "font-bold text-stone-800" : "text-stone-500")}>
        <span>{label}</span>
        <span className={bold ? "text-olive-700" : ""}>{formatPrice(value)}</span>
      </div>
    </>
  );
}

export function CheckoutView({ items, isConfirming, error, onEdit, onConfirm, className }: Props) {
  const sub = cartSubtotal(items);
  const tax = cartTax(sub);
  const total = cartTotal(sub, tax);

  return (
    <aside className={cn("hidden lg:flex w-64 flex-col border-l border-cream-300 bg-[#fffdf9]", className)}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-cream-300 bg-olive-700 text-white shrink-0">
        <p className="font-serif font-bold text-sm">Order Summary</p>
        <p className="text-xs text-olive-200 mt-0.5">Review before confirming</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Item lines */}
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-stone-700 leading-snug">
                {item.name}
                <span className="text-stone-400 ml-1">×{item.quantity}</span>
              </span>
              <span className="font-medium text-stone-800 shrink-0 ml-2">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-3 space-y-1.5">
          <Row label="Subtotal" value={sub} />
          <Row label="Tax (8%)" value={tax} />
          <Row label="Total" value={total} bold divider />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="px-3 pb-4 pt-2 shrink-0 flex flex-col gap-2">
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className={cn(
            "w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm",
            isConfirming
              ? "bg-olive-400 text-white cursor-not-allowed"
              : "bg-olive-700 hover:bg-olive-800 text-white"
          )}
        >
          {isConfirming ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Confirming…
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Confirm Order
            </>
          )}
        </button>
        <button
          onClick={onEdit}
          disabled={isConfirming}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-olive-700 hover:text-olive-800 font-medium py-2 rounded-xl hover:bg-olive-50 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={13} />
          Edit Order
        </button>
      </div>
    </aside>
  );
}
