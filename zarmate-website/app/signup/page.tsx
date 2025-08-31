// app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("");

	async function handleSignUp(e: React.FormEvent) {
		e.preventDefault();
		setStatus("Signing you up...");

		// --- 1. Prepare the data for the backend ---
		const nameParts = name.trim().split(/\s+/);
		const firstName = nameParts[0];
		const lastName = nameParts.slice(1).join(" ") || "User"; // Handle single names

		// Create a simple handle from the name (e.g., "John Smith" -> "@johnsmith")
		const handle = `@${name.trim().toLowerCase().replace(/\s+/g, "")}`;

		const payload = {
		  handle,
		  whatsappNumber: phone,
		  email,
		  firstName,
		  lastName,
		};

		try {
	      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        	method: "POST",
        	headers: { "Content-Type": "application/json" },
        	body: JSON.stringify(payload),
			});
			if (res.ok) {
				setStatus("✅ Success! Check your WhatsApp for your welcome message.");
				setName("");
				setPhone("");
				setEmail("");
			} else {
				const text = await res.text();
				setStatus(`❌ Error signing up. ${text || "Please try again."}`);
			}
		} catch (error) {
			setStatus("❌ Network error. Please try again.");
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#041827] via-[#082733] to-[#041827] text-gray-100 flex items-start py-16">
			<div className="max-w-3xl mx-auto w-full px-6">
				<Link href="/" className="text-cyan-400 mb-8 inline-block">
					&larr; Back to Home
				</Link>
				<h1 className="text-3xl font-bold mb-6">Create your ZarMate account</h1>
				<form
					onSubmit={handleSignUp}
					className="bg-[#072f39] p-8 rounded-2xl shadow-lg space-y-4 border border-[#10424a]"
				>
					<input
						type="text"
						placeholder="Full Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full border border-[#123a45] bg-[#041827] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
					/>
					<input
						type="tel"
						placeholder="WhatsApp Number"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						required
						className="w-full border border-[#123a45] bg-[#041827] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
					/>
					<input
						type="email"
						placeholder="Email Address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full border border-[#123a45] bg-[#041827] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
					/>
					<button
						type="submit"
						className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#02202b] font-semibold py-3 rounded-lg transition-colors"
					>
						Create Account
					</button>
					{status && <p className="text-center text-sm mt-2">{status}</p>}
				</form>
			</div>
		</main>
	);
}