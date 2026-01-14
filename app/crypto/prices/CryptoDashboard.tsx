"use client"; // This component runs on the client (browser) because it uses hooks like useState/useEffect

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Next.js App Router hooks
import Link from "next/link"; // For client-side navigation

// Define the TypeScript interface for a crypto row
interface CryptoPrice {
    id: number;
    symbol: string;
    name: string;
    price_usd: number;
    market_cap: number;
    timestamp: string;
}

// Main component
export default function CryptoDashboard({
    initialData,
}: {
    initialData: CryptoPrice[];
}) {
    const searchParams = useSearchParams(); // Read query parameters from URL
    const router = useRouter(); // Router object to push/replace URL

    // Keep a local state copy of the data (we could also just use initialData)
    const [data] = useState<CryptoPrice[]>(initialData);

    // Normalize numeric fields to ensure proper sorting/filtering
    const normalizedData = useMemo(
        () =>
            initialData.map((c) => ({
                ...c, // spread operator [...] copies all existing properties of c
                price_usd: Number(c.price_usd), // ensure number type
                market_cap: Number(c.market_cap), // ensure number type
            })),
        [initialData] // recalc if initialData changes
    );

    // Search text state (initialized from URL query params)
    const [search, setSearch] = useState(searchParams.get("search") || "");

    // Minimum price filter (initialized from URL query params)
    const [minPrice, setMinPrice] = useState<number | "">(
        searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : ""
    );

    // Slider state for minimum market cap in BILLIONS
    const [minMarketCapB, setMinMarketCapB] = useState<number>(
        searchParams.get("minMarketCapB") ? Number(searchParams.get("minMarketCapB")) : 0
    );

    // Convert slider value (billions) to raw USD for comparison
    const minMarketCapUSD = minMarketCapB * 1_000_000_000;

    // Sort key state
    const [sortKey, setSortKey] = useState<"price" | "market_cap" | "name">(
        (searchParams.get("sort") as any) || "price"
    );

    // Keep the URL in sync with current state
    useEffect(() => {
        const params = new URLSearchParams(); // Create a URLSearchParams object
        if (search) params.set("search", search); // Add search text if present
        if (minPrice !== "") params.set("minPrice", String(minPrice)); // Add min price
        if (minMarketCapB > 0) params.set("minMarketCapB", String(minMarketCapB)); // Add slider value
        params.set("sort", sortKey); // Always include sort key

        // Navigate to the provided href. Replaces the current history entry.
        router.replace(`/crypto/prices?${params.toString()}`, undefined);
    }, [search, minPrice, minMarketCapB, sortKey, router]); // re-run effect if any state changes

    // Filter the data based on search, minPrice, and slider
    const filteredData = useMemo(
        () =>
            normalizedData.filter((c) => {
                // Filter by search term (symbol or name)
                if (
                    search &&
                    !c.symbol.toLowerCase().includes(search.toLowerCase()) &&
                    !c.name.toLowerCase().includes(search.toLowerCase())
                )
                    return false;

                // Filter by minimum price
                if (minPrice !== "" && c.price_usd < minPrice) return false;

                // Filter by minimum market cap in USD
                if (minMarketCapUSD > 0 && c.market_cap < minMarketCapUSD) return false;

                return true; // keep the row if it passes all filters
            }),
        [normalizedData, search, minPrice, minMarketCapUSD] // recompute when any dependency changes
    );

    // Sort the filtered data based on sortKey
    const sortedData = useMemo(
        () =>
            [...filteredData].sort((a, b) => {
                // [...filteredData] creates a shallow copy to avoid mutating original array
                if (sortKey === "price") return b.price_usd - a.price_usd; // descending by price
                if (sortKey === "market_cap") return b.market_cap - a.market_cap; // descending by market cap
                return a.name.localeCompare(b.name); // alphabetical by name
            }),
        [filteredData, sortKey] // recompute when filteredData or sortKey changes
    );

    // Render the component
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Crypto Prices</h1>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Search input */}
                <input
                    placeholder="Search by symbol or name (e.g. BTC, Ethereum)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-1 border rounded"
                />

                {/* Minimum price input */}
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) =>
                        setMinPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    className="px-3 py-1 border rounded"
                />

                {/* Slider for minimum market cap */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                        Min Market Cap: ${minMarketCapB}B
                    </label>

                    <input
                        type="range"
                        min={0}
                        max={2000}
                        step={10}
                        value={minMarketCapB}
                        onChange={(e) => setMinMarketCapB(Number(e.target.value))}
                        className="w-64"
                    />
                </div>

                {/* Sort buttons */}
                <button
                    onClick={() => setSortKey("price")}
                    className={`px-3 py-1 border rounded ${sortKey === "price" ? "bg-blue-600 text-white" : ""
                        }`}
                >
                    Sort by Price
                </button>

                <button
                    onClick={() => setSortKey("market_cap")}
                    className={`px-3 py-1 border rounded ${sortKey === "market_cap" ? "bg-blue-600 text-white" : ""
                        }`}
                >
                    Sort by Market Cap
                </button>

                <button
                    onClick={() => setSortKey("name")}
                    className={`px-3 py-1 border rounded ${sortKey === "name" ? "bg-blue-600 text-white" : ""
                        }`}
                >
                    Sort by Name
                </button>
            </div>

            {/* Table */}
            <table className="min-w-full border">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-left">Symbol</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Price (USD)</th>
                        <th className="px-4 py-2 text-left">Market Cap</th>
                        <th className="px-4 py-2 text-left">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((c) => (
                        <tr key={c.id}>
                            <td className="px-4 py-2 text-left">
                                <Link href={`/crypto/${c.symbol}`}>{c.symbol}</Link>
                            </td>
                            <td className="px-4 py-2 text-left">{c.name}</td>
                            <td className="px-4 py-2 text-left">${c.price_usd.toLocaleString()}</td>
                            <td className="px-4 py-2 text-left">${c.market_cap.toLocaleString()}</td>
                            <td className="px-4 py-2 text-left">{new Date(c.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


//useEffect - For side effects (things that happen outside React)

// Fetching data
// Updating the DOM directly
// Setting up subscriptions
// Syncing with external systems (like your URL params)
// Runs after render

// useMemo - For expensive calculations (things that happen inside React)

// Caching computed values
// Preventing unnecessary recalculations
// Optimizing performance
// Returns a value
// Runs during render

// What "memoized" means:
// Memoization = remembering/caching a result so you don't have to recalculate it. Like writing down the answer to a math problem so you don't have to solve it again.
// Example from your code:
// Your filtering and sorting could use useMemo:
// tsx// Without useMemo - recalculates on EVERY render (even unrelated state changes)
// const sorted = [...filtered].sort((a, b) => {
//     if (sortKey === "price") return b.price_usd - a.price_usd;
//     // ...
// });

// // With useMemo - only recalculates when dependencies change
// const sorted = useMemo(() => {
//     return [...filtered].sort((a, b) => {
//         if (sortKey === "price") return b.price_usd - a.price_usd;
//         // ...
//     });
// }, [filtered, sortKey]);
// When to use what:

// useEffect → "Do something when X changes" (side effects)
// useMemo → "Calculate something expensive and remember it" (performance)

// In your case, the URL syncing with useEffect is correct! You wouldn't use useMemo for that since updating the URL is a side effect, not a calculation.
