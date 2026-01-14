// server component

import CryptoDashboard from "./CryptoDashboard";

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

    return <CryptoDashboard initialData={data} />;
}
