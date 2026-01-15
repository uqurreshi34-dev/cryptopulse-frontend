// server component

import CryptoDashboard from "./CryptoDashboard";

// no-store → always fresh

// Runs on server → no CORS issues

// One request per page load
async function getRefreshStatus() {
    const res = await fetch(
        "https://cryptopulse-backend-102g.onrender.com/api/crypto/refresh-status/",
        { cache: "no-store" } // always fresh
    );

    if (!res.ok) return null;

    return res.json();
}

async function getCryptoPrices() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto/prices/`, {
        cache: "no-store", // always fresh (for now)
    });

    if (!res.ok) {
        throw new Error("Failed to fetch crypto prices");
    }

    return res.json();
}

export default async function PricesPage() {
    const data = await getCryptoPrices();
    const refreshStatus = await getRefreshStatus();
    return <CryptoDashboard initialData={data} lastUpdated={refreshStatus?.last_updated}/>;
}
