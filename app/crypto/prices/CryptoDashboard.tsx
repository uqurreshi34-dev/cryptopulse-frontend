"use client"; // This component runs on the client (browser) because it uses hooks like useState/useEffect/useMemo

import { useEffect, useState, useMemo, useCallback } from "react";
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
    initialData, lastUpdated
}: {
    initialData: CryptoPrice[];
    lastUpdated?: string | null;
}) {


// Update banner logic
// We compare two authoritative timestamps

// If they’re within 60 seconds → backend just refreshed
// // using setTimeout otherwise get Next.js 15 synchronous error setShowBanner
 // Therefore using setTimeout 
// When lastUpdated changes → useEffect runs immediately after the render that was caused by the state/prop change that updated lastUpdated.
// → You're calling setState during the same render cycle (flush phase) → React warns:
// "Cannot update a component (X) while rendering a different component (Y).
// To locate the bad setState() call..."
const [showBanner, setShowBanner] = useState(false);
useEffect(() => {
    if (!lastUpdated) return;
  
    const age = Date.now() - new Date(lastUpdated).getTime();
    const shouldShow = age < 60_000;
    const timer = setTimeout(() => {
      setShowBanner(shouldShow);
    }, 0);
  
    return () => clearTimeout(timer);
  }, [lastUpdated]);


    const searchParams = useSearchParams(); // Read query parameters from URL
    const router = useRouter(); // Router object to push/replace URL

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
    type SortKey = "price" | "market_cap" | "name";
    const isValidSortKey = (value: string | null): value is SortKey => {
        return value === "price" || value === "market_cap" || value === "name";
    };
    const sortParam = searchParams.get("sort");
    const [sortKey, setSortKey] = useState<SortKey>(
        isValidSortKey(sortParam) ? sortParam : "price"
    );

    // Keep the URL in sync with current state
    // useEffect(() => {
    //     const params = new URLSearchParams(); 
    //     if (search) params.set("search", search); 
    //     if (minPrice !== "") params.set("minPrice", String(minPrice)); 
    //     if (minMarketCapB > 0) params.set("minMarketCapB", String(minMarketCapB)); 
    //     params.set("sort", sortKey); // Always include sort key

    //     
    //     router.replace(`/crypto/prices?${params.toString()}`, { scroll: false });
    // }, [search, minPrice, minMarketCapB, sortKey, router]); 

    const syncUrl = useCallback(() => {
        const params = new URLSearchParams(); // Create a URLSearchParams object
      
        if (search) params.set("search", search); // Add search text if present
        if (minPrice !== "") params.set("minPrice", String(minPrice)); // Add min price
        if (minMarketCapB > 0) params.set("minMarketCapB", String(minMarketCapB)); // Add slider value
        params.set("sort", sortKey);
      
        const queryString = params.toString();
        const newUrl = `/crypto/prices${queryString ? `?${queryString}` : ''}`;
      // Navigate to the provided href. Replaces the current history entry.
     // scroll false prevents page jump on update
        router.replace(newUrl, { scroll: false });
      }, [search, minPrice, minMarketCapB, sortKey, router]); // // re-run effect if any state deps or router change
      
      // Debounce the sync to prevent rapid-fire calls (e.g. slider dragging)
      useEffect(() => {
        const timer = setTimeout(() => {
          syncUrl();
        }, 300); // 300ms debounce - feels instant but avoids spam
      
        return () => clearTimeout(timer);
      }, [syncUrl]); // Only re-run when syncUrl changes (i.e., when deps change)





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

            {showBanner && (
        <div className="mb-4 rounded border border-green-300 bg-green-100 px-4 py-2 text-green-800">
        🔄 Prices were just refreshed
        </div>
    )}

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Search input */}
                <input
                    placeholder="Search by symbol or name"
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
            {/* hidden md:table-cell means:
hidden by default (on small screens / mobile)
table-cell (visible) only starting from the md breakpoint (~768px and up — typical tablet/desktop) - SEE 
'UDPATED' <th> and <td> and notice on small devices sm, we hide 'MARKET_CAP' <th> and <td>  */}
            {/* Table */}
            tsx<div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Symbol
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Name
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Price (USD)
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden sm:table-cell">
          Market Cap
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">
          Updated
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
      {sortedData.map((c) => (
        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
            <Link href={`/crypto/${c.symbol}`} className="text-blue-600 hover:underline">
              {c.symbol}
            </Link>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {c.name}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
            ${c.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
            ${c.market_cap.toLocaleString()}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
            {new Date(c.timestamp).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
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
