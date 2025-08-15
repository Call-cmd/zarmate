// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-[#041827] via-[#082733] to-[#041827] text-gray-100 flex items-start py-16">
			<div className="max-w-4xl mx-auto w-full px-6">
				<Link href="/" className="text-cyan-400 mb-8 inline-block">
					&larr; Back to Home
				</Link>
				<h1 className="text-3xl font-bold mb-4">About ZarMate</h1>
				<p className="text-gray-300 mb-6">
					ZarMate is a payments and rewards platform designed for students and
					campus merchants. Using LZAR stablecoins on the Lisk blockchain,
					ZarMate provides instant transfers, rewards for participation, and
					QR-based merchant payments — all via WhatsApp.
				</p>

				<h2 className="text-2xl font-semibold mb-3">Why ZarMate?</h2>
				<ul className="list-disc list-inside text-gray-300 mb-6">
					<li>No separate app — everything works through WhatsApp.</li>
					<li>
						Secure wallets managed by the platform (no private keys for users).
					</li>
					<li>Built-in rewards and coupons for campus engagement.</li>
				</ul>

				<Link
					href="/signup"
					className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-md font-semibold text-[#02202b]"
				>
					Create an account
				</Link>
			</div>
		</main>
	);
}