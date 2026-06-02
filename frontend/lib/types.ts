export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chunkCount?: number;
  isStreaming?: boolean;
}

export interface OrderEntry {
  order_details: string;
  confirmation: string;
}

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  allergens: string[];
  tags: ("vegetarian" | "vegan" | "gluten-free")[];
  note?: string;
}

export interface MenuCategory {
  name: string;
  emoji: string;
  items: MenuItem[];
}
