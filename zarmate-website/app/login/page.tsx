// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState("");
	const [status, setStatus] = useState("");
	const { login } = useAuth();

	 async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Logging in...");
    try {
      await login(identifier);
      // The context handles redirection on success
    } catch (error) {
      setStatus(
        error instanceof Error ? `❌ ${error.message}` : "❌ An error occurred"
      );
    }
  }

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#041827] via-[#082733] to-[#041827] text-gray-100 flex items-start py-16">
			<div className="max-w-2xl mx-auto w-full px-6">
				<Link href="/" className="text-cyan-400 mb-8 inline-block">
					&larr; Back to Home
				</Link>
				<h1 className="text-3xl font-bold mb-6">Login to ZarMate</h1>
				<form
					onSubmit={handleLogin}
					className="bg-[#072f39] p-8 rounded-2xl shadow-lg space-y-4 border border-[#10424a]"
				>
					<input
						type="text"
						placeholder="Email or WhatsApp Number"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						required
						className="w-full border border-[#123a45] bg-[#041827] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
					/>
					<button
						type="submit"
						className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#02202b] font-semibold py-3 rounded-lg transition-colors"
					>
						Continue
					</button>
					{status && <p className="text-center text-sm mt-2">{status}</p>}
				</form>
			</div>
		</main>
	);
}