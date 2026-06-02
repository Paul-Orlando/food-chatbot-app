"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, UtensilsCrossed } from "lucide-react";
import { menuData } from "@/lib/menu-data";
import { MenuCard } from "./MenuCard";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import type { CartItem } from "@/lib/cart";

interface Props {
  onChatSelect: (name: string) => void;
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (name: string, delta: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuPanel({ onChatSelect, cartItems, onAddToCart, onUpdateQuantity, isOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));

  const getQuantity = (name: string) =>
    cartItems.find((i) => i.name === name)?.quantity ?? 0;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 flex flex-col bg-[#fffdf9] border-r border-cream-300 shadow-lg",
          "transition-transform duration-300",
          "lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-cream-300 bg-olive-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} />
            <span className="font-serif font-bold text-base">Our Menu</span>
          </div>
          <button onClick={onClose} className="lg:hidden hover:opacity-70 transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Note */}
        <div className="px-4 py-2 bg-olive-50 border-b border-olive-100 shrink-0">
          <p className="text-xs text-olive-700">
            Add items to cart or click a name to ask about it in chat
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {menuData.map((category) => (
            <div key={category.name} className="rounded-xl border border-cream-200 overflow-hidden">
              <button
                onClick={() => toggle(category.name)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-cream-100 hover:bg-cream-200 transition-colors"
              >
                <span className="font-semibold text-sm text-stone-700 flex items-center gap-2">
                  <span>{category.emoji}</span>
                  {category.name}
                  <span className="text-xs font-normal text-stone-400">
                    ({category.items.length})
                  </span>
                </span>
                {collapsed[category.name] ? (
                  <ChevronDown size={14} className="text-stone-400" />
                ) : (
                  <ChevronUp size={14} className="text-stone-400" />
                )}
              </button>

              {!collapsed[category.name] && (
                <div className="p-2 space-y-2 bg-white">
                  {category.items.map((item) => (
                    <MenuCard
                      key={item.name}
                      item={item}
                      cartQuantity={getQuantity(item.name)}
                      onAddToCart={() => onAddToCart(item)}
                      onUpdateQuantity={(delta) => onUpdateQuantity(item.name, delta)}
                      onChatSelect={(name) => {
                        onChatSelect(name);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Ordering notes */}
          <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-600">Ordering Notes</p>
            <p>Gluten-free pasta available (+$2.00)</p>
            <p>Vegan cheese available (+$1.50)</p>
            <p>All prices include tax</p>
          </div>
        </div>
      </aside>
    </>
  );
}
