// app/crypto/prices/layout.tsx
import React from "react";

export default function PricesLayout({ children }: { children: React.ReactNode }) {
    // This layout wraps all pages inside crypto/prices
    // It does not include any route-specific types — Next.js infers the route
    return (
        <div className="container mx-auto">
            {children} {/* Renders the page component inside this layout */}
        </div>
    );
}
