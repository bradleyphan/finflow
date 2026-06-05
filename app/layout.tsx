import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { StoreProvider } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";

export const metadata: Metadata = {
  title: "FinFlow — Personal Finance Dashboard",
  description: "Your personalized financial dashboard with Wealth Firewall™ and 60/40 split tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen antialiased">
        <StoreProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <HydrationGate>{children}</HydrationGate>
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
