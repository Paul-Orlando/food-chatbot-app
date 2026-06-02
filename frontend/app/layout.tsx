import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bella Vista — Order Online",
  description: "Chat with our AI assistant to explore the menu and place your order.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
