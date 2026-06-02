"use client";

import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrderEntry } from "@/lib/types";

interface Props {
  orders: OrderEntry[];
}

export function OrderSummary({ orders }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (orders.length === 0) {
    return (
      <aside className="hidden xl:flex w-64 flex-col border-l border-cream-300 bg-[#fffdf9]">
        <div className="px-4 py-4 border-b border-cream-300 bg-olive-700 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} />
            <span className="font-serif font-bold text-sm">Your Order</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 text-stone-400">
          <ShoppingBag size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">No items yet</p>
          <p className="text-xs mt-1">Ask about the menu or click an item to get started</p>
        </div>
      </aside>
    );
  }

  const latestOrder = orders[orders.length - 1];

  return (
    <aside className="hidden xl:flex w-64 flex-col border-l border-cream-300 bg-[#fffdf9]">
      <div className="px-4 py-4 border-b border-cream-300 bg-olive-700 text-white">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} />
          <span className="font-serif font-bold text-sm">Your Order</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Order count badge */}
        {orders.length > 1 && (
          <div className="px-4 py-2 bg-terracotta-50 border-b border-terracotta-100">
            <p className="text-xs text-terracotta-700 font-medium">
              {orders.length} order{orders.length > 1 ? "s" : ""} placed this session
            </p>
          </div>
        )}

        {/* Latest confirmation */}
        <div className="p-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-between mb-3 text-sm font-semibold text-stone-700"
          >
            <span>Latest Order</span>
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {!collapsed && (
            <div
              className={cn(
                "text-xs text-stone-600 leading-relaxed whitespace-pre-wrap",
                "bg-cream-50 border border-cream-200 rounded-xl p-3"
              )}
            >
              {latestOrder.confirmation}
            </div>
          )}
        </div>

        {/* Previous orders */}
        {orders.length > 1 && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Previous
            </p>
            {orders.slice(0, -1).reverse().map((order, i) => (
              <div
                key={i}
                className="text-xs text-stone-500 bg-cream-50 border border-cream-200 rounded-xl p-3 whitespace-pre-wrap"
              >
                {order.confirmation}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
