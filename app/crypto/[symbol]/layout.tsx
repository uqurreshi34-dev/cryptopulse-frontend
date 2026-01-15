// app/crypto/[symbol]/layout.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline"; // ← Install @heroicons/react if not already

export default function SymbolLayout({ children }: { children: React.ReactNode }) {
    // This layout wraps all pages inside a dynamic [symbol] route
    // Useful for consistent spacing, padding, or global controls (like back buttons)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header with Back Button */}
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/crypto/prices"
            className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 transition group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>

          {/* Optional: You can add coin name/symbol here later if passed as prop */}
          {/* <h1 className="text-2xl font-bold sm:text-3xl">Bitcoin (BTC)</h1> */}
        </header>

        {/* Main content area */}
        <main>{children}</main>
      </div>
    </div>
  );
}
