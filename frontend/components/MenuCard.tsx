import { Plus, Minus, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

const TAG_STYLES = {
  vegetarian: "bg-green-50 text-green-700 border-green-200",
  vegan: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "gluten-free": "bg-amber-50 text-amber-700 border-amber-200",
} as const;

const TAG_LABELS = {
  vegetarian: "🌱 Vegetarian",
  vegan: "🌿 Vegan",
  "gluten-free": "GF",
} as const;

interface Props {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  onChatSelect: (name: string) => void;
}

export function MenuCard({ item, cartQuantity, onAddToCart, onUpdateQuantity, onChatSelect }: Props) {
  return (
    <div
      className={cn(
        "w-full text-left p-3 rounded-xl border bg-cream-50 transition-all duration-150",
        cartQuantity > 0
          ? "border-olive-400 bg-olive-50 shadow-sm"
          : "border-cream-300 hover:border-olive-300 hover:bg-cream-100"
      )}
    >
      {/* Header row — click name to open in chat */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <button
          onClick={() => onChatSelect(item.name)}
          className="font-semibold text-sm text-stone-800 hover:text-olive-700 transition-colors leading-tight text-left"
          title="Ask about this item in chat"
        >
          {item.name}
        </button>
        <span className="text-sm font-bold text-terracotta-600 shrink-0">
          {formatPrice(item.price)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-500 leading-snug mb-2">{item.description}</p>

      {/* Note */}
      {item.note && (
        <p className="text-xs text-stone-400 italic mb-2">{item.note}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
              TAG_STYLES[tag]
            )}
          >
            {TAG_LABELS[tag]}
          </span>
        ))}
        {item.allergens.map((allergen) => (
          <span
            key={allergen}
            className="text-[10px] px-1.5 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200"
          >
            {allergen}
          </span>
        ))}
      </div>

      {/* Cart controls */}
      {cartQuantity === 0 ? (
        <button
          onClick={onAddToCart}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-olive-700 hover:bg-olive-800 text-white transition-colors"
        >
          <ShoppingCart size={11} />
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-between bg-white border border-olive-300 rounded-lg px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(-1)}
            className="w-6 h-6 rounded-full bg-olive-100 hover:bg-olive-200 flex items-center justify-center transition-colors"
          >
            <Minus size={10} className="text-olive-700" />
          </button>
          <span className="text-sm font-bold text-olive-800">{cartQuantity} in cart</span>
          <button
            onClick={() => onUpdateQuantity(1)}
            className="w-6 h-6 rounded-full bg-olive-100 hover:bg-olive-200 flex items-center justify-center transition-colors"
          >
            <Plus size={10} className="text-olive-700" />
          </button>
        </div>
      )}
    </div>
  );
}
