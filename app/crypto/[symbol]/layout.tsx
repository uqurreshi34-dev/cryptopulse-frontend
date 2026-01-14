// app/crypto/[symbol]/layout.tsx
import React from "react";

export default function SymbolLayout({ children }: { children: React.ReactNode }) {
    // This layout wraps all pages inside a dynamic [symbol] route
    // Useful for consistent spacing, padding, or global controls (like back buttons)
    return (
        <div className="container mx-auto p-4 border-4 border-red-500">
            {children} {/* Renders the page for the specific symbol */}
        </div>
    );
}
