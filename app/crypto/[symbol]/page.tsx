// app/crypto/[symbol]/page.tsx
// SERVER COMPONENT: Fetches data on the server for better performance/SEO
import { notFound } from "next/navigation";
import PriceChartWrapper from './PriceChartWrapper';

// Props type for the dynamic [symbol] route
interface PageProps {
  params: Promise<{ symbol: string }>;
}

// Interface matching NewsData.io response structure
interface NewsItem {
  title: string;
  link: string;          // Full external URL
  description: string;   // Article summary
  pubDate: string;       // ISO date string
  source_id: string;     // e.g. "coindesk"
  source_name?: string;  // Human-readable source (fallback to source_id if missing)
}

export default async function CryptoSymbolPage({ params }: PageProps) {
  // 1. Get symbol from URL
  const { symbol } = await params;

  // 2. Fetch current coin details from your backend
  const currentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto/${symbol}/`, {
    cache: "no-store", // Always fresh data
  });

  if (!currentRes.ok) notFound();

  const data = await currentRes.json();

  // 3. Fetch 30-day price history from CoinGecko
  const coinId = data.coingecko_id || data.symbol.toLowerCase();

  if (!coinId) {
    console.warn(`No CoinGecko ID available for ${data.symbol}`);
  }

  const cgRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily&precision=full`,
    {
      headers: {
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
      },
      cache: "no-store",
    }
  );

  let historyData: { timestamp: number; price: number }[] = [];
  if (cgRes.ok) {
    const cgData = await cgRes.json();
    historyData = cgData.prices.map(([ts, price]: [number, number]) => ({
      timestamp: ts,
      price,
    }));
  } else {
    console.error(`CoinGecko history fetch failed for ${coinId}:`, cgRes.status);
  }

  // 4. Fetch recent news from NewsData.io (free tier)
  const newsRes = await fetch(
    `https://newsdata.io/api/1/crypto?apikey=${process.env.NEWSDATA_IO_KEY}&q=${encodeURIComponent(
      data.symbol.toUpperCase()
    )}&size=5&language=en`,
    { cache: "no-store" }
  );

  let newsItems: NewsItem[] = [];
  if (newsRes.ok) {
    const newsJson = await newsRes.json();
    newsItems = (newsJson.results || []) as NewsItem[];
  } else {
    console.error("NewsData.io failed:", newsRes.status, await newsRes.text());
  }

  // 5. Render the full page
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
      {/* Header: Coin name, symbol, current price */}
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
              maximumFractionDigits: 8,
            })}
          </p>
        </div>
      </div>

      {/* Price History Chart Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          30-Day Price History (USD)
        </h2>
        {historyData.length > 0 ? (
          <PriceChartWrapper data={historyData} />
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Loading chart data...</p>
        )}
      </div>

      {/* Stats Grid: Market Cap + Last Updated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
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

      {/* Recent News Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent News for {data.name} ({data.symbol.toUpperCase()})
        </h2>

        {/* Show articles if available */}
        {newsItems.length > 0 ? (
          <div className="space-y-6">
            {newsItems.map((item: NewsItem) => (
              <div
              key={item.link} //(no stable ID from API)
                className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                {/* Article title */}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>

                {/* Date and source */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.pubDate).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}{' • '}
                  {item.source_name || item.source_id || 'Unknown Source'}
                </p>

                {/* Short description preview */}
                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                  {item.description || 'No description available.'}
                </p>

                {/* External link - opens in new tab */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No recent news available right now (try again later or check your NewsData.io API key).
          </p>
        )}
      </div>
    </div>
  );
}
