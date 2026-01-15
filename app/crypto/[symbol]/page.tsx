// app/crypto/[symbol]/page.tsx
import { notFound } from "next/navigation";
import PriceChartWrapper from './PriceChartWrapper';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

// need to match API fields in https://free-crypto-news.vercel.app/api/news?ticker=BTC&limit=3 etc
interface NewsItem {
  title: string;
  pubDate: string;
  source: string;
  description: string;
  link: string;
}

export default async function CryptoSymbolPage({ params }: PageProps) {
  const { symbol } = await params;

  // Fetch current coin data (your existing endpoint)
  const currentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto/${symbol}/`, {
    cache: "no-store",
  });

  if (!currentRes.ok) notFound();

  const data = await currentRes.json();
// Fetch historical data from CoinGecko using the reliable ID from backend
const coinId = data.coingecko_id || data.symbol.toLowerCase();

if (!coinId) {
  console.warn(`No CoinGecko ID available for ${data.symbol}`);
  // Optional: you can early-return or show error UI here
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

  // Optional: Fetch news (using free crypto news API example - see notes below)
  const newsRes = await fetch(
    `https://free-crypto-news.vercel.app/api/news?ticker=${data.symbol.toUpperCase()}&limit=5` // Example - replace with real free one
  );
  let newsItems: NewsItem[] = [];
  if (newsRes.ok) {
    const newsJson = await newsRes.json();
    newsItems = (newsJson.data || []) as NewsItem[];
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
      {/* Header - same as before */}
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

      {/* Price History Chart */}
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

      {/* Stats Grid - unchanged */}
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
          Recent News for {data.name}
        </h2>
        {newsItems.length > 0 ? (
          <div className="space-y-6">
            {newsItems.map((item: NewsItem, idx: number) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.pubDate).toLocaleDateString()} • {item.source}
                </p>
                <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                  {item.description}
                </p>
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
            No recent news available or loading...
          </p>
        )}
      </div>
    </div>
  );
}
