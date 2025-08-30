// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const features = [
    {
      title: "Create & Manage Wallet via WhatsApp",
      desc: "No private keys to manage. Wallets tied to your user account.",
    },
    {
      title: "Send & Receive Money",
      desc: "Instant ZAR transfers to friends and merchants on campus.",
    },
    {
      title: "Earn Rewards",
      desc: "Get paid for attending class, recycling, or completing surveys.",
    },
    {
      title: "Claim Promotions",
      desc: "Redeem coupons for food, drinks, and campus deals.",
    },
    {
      title: "Check Balance & History",
      desc: "Quickly see your ZAR and recent transactions.",
    },
    {
      title: "Pay via QR Code",
      desc: "Scan and pay instantly at campus merchants.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041827] via-[#082733] to-[#041827] text-gray-100">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo1.png"
            alt="ZarMate Logo"
            width={60}
            height={60}
            className="rounded-lg"
          />
          <div className="font-semibold text-lg">ZarMate</div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/about" className="hover:text-cyan-300">
            About
          </Link>
          {/* --- THIS IS THE NEW LINK --- */}
          <Link
            href="/community-fund"
            className="hover:text-cyan-300 font-medium"
          >
            Community Fund
          </Link>
          {/* ------------------------- */}
          <Link href="/signup" className="hover:text-cyan-300">
            Sign Up
          </Link>
          <Link href="/login" className="hover:text-cyan-300">
            Login
          </Link>
          <a href="#features" className="hover:text-cyan-300">
            Features
          </a>
        </div>

        <div className="md:hidden">
          {/* simple mobile placeholder for menu */}
          <Link
            href="/signup"
            className="bg-cyan-500 px-3 py-2 rounded-md text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative text-center py-24 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4">
            Payments, Rewards, and More — All on WhatsApp
          </h1>
          <p className="mb-8 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            ZarMate turns your WhatsApp into a ZAR stablecoin wallet. Send
            money, earn rewards, and pay instantly — no app needed.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-cyan-500 hover:bg-cyan-600 transition-colors text-[#02202b] font-semibold px-6 py-3 rounded-full shadow-lg"
            >
              Sign Up
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-300 underline underline-offset-4"
            >
              Learn more
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          What You Can Do with ZarMate
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 bg-[#082733] border border-[#123a45] rounded-xl shadow hover:shadow-2xl transition-shadow"
            >
              <h3 className="font-semibold text-xl mb-2 text-cyan-300">
                {f.title}
              </h3>
              <p className="text-gray-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#072a36] to-[#073d47] p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-2xl font-bold">No app. Just WhatsApp.</h3>
            <p className="text-gray-300">
              Sign up and get your ZarMate wallet linked to your WhatsApp in
              minutes.
            </p>
          </div>
          <div>
            <Link
              href="/signup"
              className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-md font-semibold text-[#02202b]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#031018] text-gray-400 text-center py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">
            © {new Date().getFullYear()} ZarMate. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about">About</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}