"use client";

import { useState, useCallback } from "react";
import type { CartItem } from "@/lib/cart";
import type { MenuItem } from "@/lib/types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { name: item.name, price: item.price, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((name: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.name === name ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return { items, addToCart, updateQuantity, removeFromCart, clearCart };
}
