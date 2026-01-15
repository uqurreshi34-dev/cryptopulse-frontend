import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ symbol: string }>;
}
// rmemeber NEXT.js sees [symbol] and pulls it from the route. See file explorer. NEXT js magic!
export default async function CryptoSymbolPage({ params }: PageProps) {
    const { symbol } = await params; // e.g. 'BTC'

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto/${symbol}/`, {
        cache: "no-store", //fresh data each time
    });

    // 🔥 THIS is the key - works only in server components
    if (!res.ok) {
        notFound(); // immediately renders 404 page
    }

    const data = await res.json();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          {/* Coin Header with Name & Symbol + Highlighted Price */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {data.name}
                <span className="ml-3 text-xl font-semibold text-gray-500 dark:text-gray-400">
                  ({data.symbol.toUpperCase()})
                </span>
              </h1>
            </div>
    
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-green-600 dark:text-green-400">
                ${data.price_usd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8, // increased for very small altcoin prices
                })}
              </p>
            </div>
          </div>
    
          {/* Stats Grid - Responsive cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600 transition hover:shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Market Cap</p>
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                ${data.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
    
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600 transition hover:shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Last Updated</p>
              <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                {new Date(data.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
    
          {/* Optional future section placeholder */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              More Information Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Historical charts, 24h change, volume, news & more will be added here...
            </p>
          </div>
        </div>
      );
}
