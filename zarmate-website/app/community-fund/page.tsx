// app/community-fund/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Users, ArrowUpCircle, Loader2 } from "lucide-react";

// A simple card component for this page
const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[#072f39]/50 p-6 rounded-xl border border-[#10424a] text-center">
    <div className="flex justify-center mb-4 text-cyan-400">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{children}</p>
  </div>
);

export default function CommunityFundPage() {
  const [fundBalance, setFundBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFundBalance() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/community-fund`
        );
        if (!res.ok) {
          throw new Error("Could not fetch fund data.");
        }
        const data = await res.json();
        setFundBalance(data.balance);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchFundBalance();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041827] via-[#082733] to-[#041827] text-gray-100 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            The ZarMate Community Fund
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Small change, big impact. See how every transaction helps build a
            stronger campus community.
          </p>
        </div>

        <div className="bg-[#072f39] p-8 md:p-12 rounded-2xl shadow-lg border border-[#10424a] mb-12">
          <h2 className="text-2xl font-semibold text-center text-gray-300 mb-2">
            Total Raised by the Community
          </h2>
          <div className="text-5xl md:text-7xl font-bold text-center text-cyan-400 py-4">
            {loading ? (
              <Loader2 className="h-16 w-16 animate-spin mx-auto" />
            ) : error ? (
              <span className="text-2xl text-red-400">{error}</span>
            ) : (
              fundBalance?.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })
            )}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8 text-white">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<ArrowUpCircle size={40} />} title="Automatic Round-Up">
              When you pay for something, your transaction is rounded up to the
              next Rand. A R12.50 coffee becomes a R13.00 payment.
            </FeatureCard>
            <FeatureCard icon={<Heart size={40} />} title="Small Contributions">
              The difference—just a few cents—is automatically contributed to
              the Community Fund. In the example above, R0.50 goes to the pool.
            </FeatureCard>
            <FeatureCard icon={<Users size={40} />} title="Community Powered">
              This pool of micro-donations is used to fund student projects,
              events, and support initiatives, decided by the community itself.
            </FeatureCard>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="bg-cyan-500 hover:bg-cyan-600 text-[#02202b] font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Join ZarMate and Start Contributing
          </Link>
        </div>
      </div>
    </main>
  );
}