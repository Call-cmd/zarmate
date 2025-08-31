ZarMate: The WhatsApp Stablecoin Wallet






ZarMate is a full-stack financial technology platform that turns WhatsApp into a seamless ZAR stablecoin wallet. Designed for campus communities, it allows students and merchants to transact, earn rewards, and manage funds without ever needing to download a separate application.

This project was built for the Build ZAR Stablecoin Payment Apps on Lisk Hackathon and demonstrates a professional, decoupled architecture with a secure backend, a dynamic frontend, and real-time WhatsApp integration.

Live Demo Links:


- Frontend Website: https://zarmate.vercel.app/
- Backend API: https://zarmate-backend-fv9kp.ondigitalocean.app/

---

🎥 Video Demo


[Link demo video to be added]


---

✨ Key Features


ZarMate is a feature-rich platform with distinct experiences for users and merchants.

For Students (via WhatsApp)

- ✅ Instant Onboarding: Sign up via a simple web form and instantly get a functional, secure wallet.
- ✅ Welcome Bonus: New users are automatically provisioned with gas and a starting balance of 50 LZAR.
- ✅ Peer-to-Peer Transfers: Send money to any other ZarMate user with a simple command (e.g., send R25 to @username).
- ✅ QR Code Payments: Pay merchants instantly by sending a payment code.
- ✅ Real-time Balance Checks: Check your wallet balance anytime with the balance command.
- ✅ Transaction History: View your recent transactions with the history command.
- ✅ Coupon Redemption: Claim promotional coupons (e.g., claim ZARCOFFEE) to receive rewards directly in your wallet.

For Merchants (via Web Dashboard)

- ✅ Secure Authentication: A full JWT-based login system protects merchant data.
- ✅ Dynamic Data Dashboard: A real-time dashboard to track key business metrics, including:
	- Live LZAR Balance
	- Pending Settlements
	- Total Transaction & Unique Customer Counts
- ✅ Live Transaction & Customer Lists: View detailed lists of all incoming payments and the customers who made them.
- ✅ Payment Generation: Create new payment requests with a specific amount and notes, which generates a unique chargeId and a scannable QR code.
- ✅ Coupon Creation: Easily create and manage promotional coupons to attract and reward customers.
- ✅ Analytics: A visual bar chart displays daily sales volume, helping merchants track performance.

Unique Social Impact Feature

- 🌍 Community Round-Up Fund: Every payment is rounded up to the next Rand, with the difference automatically contributed to a shared community pool. This fund's total is publicly visible, promoting a sense of collective good and providing a mechanism for funding student projects and initiatives.

---

🛠️ Tech Stack & Architecture


ZarMate is built with a professional, decoupled monorepo architecture to ensure scalability, security, and a fast user experience.


- 
Frontend:


	- Framework: Next.js 14 (App Router)
	- Language: TypeScript
	- Styling: Tailwind CSS
	- UI Components: Shadcn/UI
	- Charting: Recharts
	- Deployment: Vercel
- 
Backend:


	- Framework: Node.js, Express.js
	- Language: JavaScript
	- Database: PostgreSQL (Managed via Supabase)
	- Authentication: JSON Web Tokens (JWT)
	- Deployment: DigitalOcean App Platform
- 
Integrations:


	- Financial Core: Rapyd API (Hackathon Provided)
	- Messaging: Twilio API for WhatsApp
(Optional but highly recommended: Create a simple diagram showing Frontend -> Backend -> Database/Rapyd/Twilio and add it here)


---

🚀 Getting Started

Prerequisites

- Node.js (v18+)
- PostgreSQL
- A Twilio account
- API keys from the Rapyd API provider

Backend Setup (zarmate-backend)

1. Navigate to the zarmate-backend directory: cd zarmate-backend
2. Install dependencies: npm install
3. Create a .env file and populate it with the necessary variables (DATABASE_URL, RAPYD_API_KEY, JWT_SECRET, etc.).
4. Start the server: npm start

Frontend Setup (zarmate-website)

1. Navigate to the zarmate-website directory: cd zarmate-website
2. Install dependencies: npm install
3. Create a .env.local file and set NEXT_PUBLIC_API_URL to your backend's address (e.g., http://localhost:3000).
4. Start the development server: npm run dev

---

🧠 Challenges & Learnings


This project was a deep dive into real-world engineering challenges, particularly when integrating with a new and sometimes unpredictable external API.


- Debugging External Services: A significant challenge was diagnosing performance issues with the hackathon's API, which initially caused timeouts. This required methodical testing, detailed logging, and clear communication with the API providers to isolate the bottleneck. It was a valuable lesson in building resilient systems that can handle external dependencies.
- API Discrepancies: We discovered several instances where the API's real-world behavior (e.g., nested response objects, case-sensitive IDs) differed from its documentation. This reinforced the importance of defensive coding and logging real API responses to adapt to the "source of truth."
- Architecting for Resilience: Our decision to build a decoupled backend for handling slow, asynchronous jobs proved to be the correct one. It completely insulated our frontend from the backend's performance issues, a key principle for building robust applications.
This project was an incredible learning experience in full-stack development, database management, and the art of debugging complex, distributed systems.
