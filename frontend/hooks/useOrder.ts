"use client";

import { useState, useCallback } from "react";
import { getOrder } from "@/lib/api";
import type { OrderEntry } from "@/lib/types";

export function useOrder(sessionId: string) {
  const [orders, setOrders] = useState<OrderEntry[]>([]);

  const refresh = useCallback(async () => {
    const data = await getOrder(sessionId);
    setOrders(data);
  }, [sessionId]);

  return { orders, refresh };
}
