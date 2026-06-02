"use client";

import { useState, useCallback } from "react";
import { MenuPanel } from "@/components/MenuPanel";
import { ChatWindow } from "@/components/ChatWindow";
import { CartPanel } from "@/components/CartPanel";
import { CheckoutView } from "@/components/CheckoutView";
import { OrderConfirmed } from "@/components/OrderConfirmed";
import { useChat } from "@/hooks/useChat";
import { useCart } from "@/hooks/useCart";
import { confirmOrder } from "@/lib/api";
import { cartItemCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

type RightPanel = "cart" | "checkout" | "confirmed";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);   // mobile cart drawer
  const [inputValue, setInputValue] = useState("");
  const [rightPanel, setRightPanel] = useState<RightPanel>("cart");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");

  const { messages, isStreaming, sessionId, sendMessage, appendBotMessage, clearChat } = useChat();
  const { items: cartItems, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  const cartCount = cartItemCount(cartItems);

  const handleSend = useCallback(
    async (message: string) => {
      setInputValue("");
      await sendMessage(message);
    },
    [sendMessage]
  );

  const handleMenuItemChatSelect = useCallback((name: string) => {
    setInputValue(`I'd like to order the ${name}`);
    setMenuOpen(false);
  }, []);

  const handleContinueShopping = useCallback(() => {
    setCartOpen(false);
    setMenuOpen(true);
  }, []);

  const handleCheckout = useCallback(() => {
    setConfirmError(null);
    setRightPanel("checkout");
  }, []);

  const handleEditOrder = useCallback(() => {
    setRightPanel("cart");
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    if (cartItems.length === 0) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const { confirmation, orderNumber: num } = await confirmOrder(sessionId, cartItems);
      appendBotMessage(confirmation);
      clearCart();                   // spec: "Clear cart after confirmation"
      setOrderNumber(num);
      setRightPanel("confirmed");
      setCartOpen(false);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsConfirming(false);
    }
  }, [cartItems, sessionId, appendBotMessage, clearCart]);

  const handleStartNew = useCallback(async () => {
    // clearChat clears the backend session, removes sessionStorage, then reloads the page.
    // The page reload resets all React state (cart, messages, panel view) automatically.
    await clearChat();
  }, [clearChat]);

  const rightPanelContent =
    rightPanel === "checkout" ? (
      <CheckoutView
        items={cartItems}
        isConfirming={isConfirming}
        error={confirmError}
        onEdit={handleEditOrder}
        onConfirm={handleConfirmOrder}
      />
    ) : rightPanel === "confirmed" ? (
      <OrderConfirmed orderNumber={orderNumber} onStartNew={handleStartNew} />
    ) : (
      <CartPanel
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onContinueShopping={handleContinueShopping}
        onCheckout={handleCheckout}
      />
    );

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdf8f0]">
      {/* Left: Menu Panel */}
      <MenuPanel
        onChatSelect={handleMenuItemChatSelect}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Center: Chat */}
      <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onClear={clearChat}
          onMenuOpen={() => setMenuOpen(true)}
          cartCount={cartCount}
          onCartOpen={() => setCartOpen(true)}
        />
      </main>

      {/* Right panel — always visible on lg+, drawer on mobile */}
      {rightPanelContent}

      {/* Mobile cart drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setCartOpen(false)}
          />
          <div className={cn(
            "fixed inset-y-0 right-0 z-30 w-72 flex flex-col lg:hidden",
            "bg-[#fffdf9] border-l border-cream-300 shadow-xl"
          )}>
            {rightPanel === "checkout" ? (
              <CheckoutView
                items={cartItems}
                isConfirming={isConfirming}
                error={confirmError}
                onEdit={handleEditOrder}
                onConfirm={handleConfirmOrder}
                className="flex flex-col flex-1"
              />
            ) : rightPanel === "confirmed" ? (
              <OrderConfirmed
                orderNumber={orderNumber}
                onStartNew={handleStartNew}
                className="flex flex-col flex-1"
              />
            ) : (
              <CartPanel
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onContinueShopping={handleContinueShopping}
                onCheckout={handleCheckout}
                className="flex flex-col flex-1"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
