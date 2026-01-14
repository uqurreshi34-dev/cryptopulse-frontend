import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ symbol: string }>;
}

export default async function CryptoSymbolPage({ params }: PageProps) {
    const { symbol } = await params; // e.g. 'BTC'

    const res = await fetch(`http://127.0.0.1:8000/api/crypto/${symbol}/`, {
        cache: "no-store", //fresh data each time
    });

    // 🔥 THIS is the key
    if (!res.ok) {
        notFound(); // immediately renders 404 page
    }

    const data = await res.json();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">
                Crypto Symbol: {data.symbol}
            </h1>
            <p>Name: {data.name}</p>
            <p>Price: ${data.price_usd.toLocaleString()}</p>
            <p>Market Cap: ${data.market_cap.toLocaleString()}</p>
            <p>Updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
    );
}
