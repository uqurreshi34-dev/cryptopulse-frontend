import Link from "next/link";

export default function NotFound() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">
          The crypto symbol you’re looking for doesn’t exist.
        </p>
        <Link
          href="/crypto/prices"
          className="text-blue-600 underline text-lg"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }
  