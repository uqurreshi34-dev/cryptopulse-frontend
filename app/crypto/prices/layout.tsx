// app/crypto/prices/layout.tsx
import React from "react";
import { Metadata } from "next"; // Optional: For SEO if needed

// Optional metadata for the layout (inheritable by children)
export const metadata: Metadata = {
  title: "Crypto Prices Dashboard",
  description: "Responsive crypto dashboard for all devices",
};

export default function PricesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50"> {/* Full height, light bg for dashboard feel */}
      <main className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Core content wrapper — responsive padding & spacing */}
        <div className="max-w-7xl mx-auto"> {/* Tighter max-width for large screens */}
          {children} {/* Renders the page component inside this layout */}
        </div>
      </main>
    </div>
  );
}
