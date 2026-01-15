// app/crypto/[symbol]/PriceChartWrapper.tsx
'use client';  // ← This makes it a Client Component

import dynamic from 'next/dynamic';

// Dynamically import the actual chart (with ssr: false allowed here!)
const PriceChart = dynamic(() => import('./PriceChart'), {
  ssr: false,           // Now legal because we're in a Client Component
  loading: () => (
    <div className="h-80 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">Loading chart...</p>
    </div>
  ),
});

interface Props {
  data: { timestamp: number; price: number }[];
}

export default function PriceChartWrapper({ data }: Props) {
  return <PriceChart data={data} />;
}
