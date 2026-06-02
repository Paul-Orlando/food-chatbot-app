export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

export const TAX_RATE = 0.08;

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function cartTotal(subtotal: number, tax: number): number {
  return Math.round((subtotal + tax) * 100) / 100;
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
