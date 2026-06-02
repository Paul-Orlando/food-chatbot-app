"use client";

import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, UtensilsCrossed } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { cartSubtotal, cartTax, cartTotal, cartItemCount, type CartItem } from "@/lib/cart";

interface Props {
  items: CartItem[];
  onUpdateQuantity: (name: string, delta: number) => void;
  onRemove: (name: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
  className?: string;
}

function TotalRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: number;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex justify-between text-sm", bold && "font-bold text-stone-800", muted && "text-stone-400")}>
      <span>{label}</span>
      <span>{formatPrice(value)}</span>
    </div>
  );
}

export function CartPanel({ items, onUpdateQuantity, onRemove, onContinueShopping, onCheckout, className }: Props) {
  const sub = cartSubtotal(items);
  const tax = cartTax(sub);
  const total = cartTotal(sub, tax);
  const count = cartItemCount(items);

  return (
    <aside className={cn("hidden lg:flex w-64 flex-col border-l border-cream-300 bg-[#fffdf9]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-cream-300 bg-olive-700 text-white shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} />
          <span className="font-serif font-bold text-sm">Your Cart</span>
        </div>
        {count > 0 && (
          <span className="bg-terracotta-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 text-stone-400">
          <ShoppingCart size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">Your cart is empty</p>
          <p className="text-xs mt-1 leading-snug">
            Click <strong>Add to Cart</strong> on any menu item to get started
          </p>
        </div>
      ) : (
        <>
          {/* Item list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-xl border border-cream-200 px-3 py-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-stone-800 leading-tight">{item.name}</p>
                  <button
                    onClick={() => onRemove(item.name)}
                    className="text-stone-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{formatPrice(item.price)} each</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.name, -1)}
                      className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-cream-100 hover:border-olive-300 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-bold text-stone-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.name, 1)}
                      className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-cream-100 hover:border-olive-300 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs font-semibold text-terracotta-600">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-4 py-3 border-t border-cream-200 bg-cream-50 shrink-0 space-y-1.5">
            <TotalRow label="Subtotal" value={sub} muted />
            <TotalRow label="Tax (8%)" value={tax} muted />
            <div className="border-t border-cream-300 pt-1.5 mt-1">
              <TotalRow label="Total" value={total} bold />
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-3 pb-4 pt-2 shrink-0 flex flex-col gap-2">
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 bg-olive-700 hover:bg-olive-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Proceed to Checkout
              <ChevronRight size={15} />
            </button>
            <button
              onClick={onContinueShopping}
              className="w-full text-sm text-olive-700 hover:text-olive-800 font-medium py-2 rounded-xl hover:bg-olive-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <UtensilsCrossed size={13} />
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
