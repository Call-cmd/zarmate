// app/dashboard/merchant/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle"; // Import the toggle
import {
	Search,
	LayoutDashboard,
	ArrowRightLeft,
	Users,
	BarChart,
	Settings,
	QrCode,
	Banknote,
	LogOut,
} from "lucide-react";
import Image from "next/image";

// StatCard is now theme-aware
const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string; }) => (
	<Card className="bg-gray-50 dark:bg-[#082733] border-gray-200 dark:border-[#123a45] text-gray-900 dark:text-gray-100 transition-all hover:border-cyan-400/50">
		<CardHeader className="pb-2">
			<CardTitle className="text-base font-medium text-gray-500 dark:text-gray-300">{title}</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">{value}</div>
			{subtitle && <p className="text-xs text-gray-400 dark:text-gray-400">{subtitle}</p>}
		</CardContent>
	</Card>
);

export default function MerchantDashboard() {
	const [activeItem, setActiveItem] = useState("Overview");
	// ... (navItems, transactions arrays remain the same)
	const navItems = [ { name: "Overview", icon: LayoutDashboard }, { name: "Transactions", icon: ArrowRightLeft }, { name: "Customers", icon: Users }, { name: "Analytics", icon: BarChart }, { name: "Settings", icon: Settings }, ];
	const transactions = [ { date: "19 Aug 2025", customer: "John M.", amount: "150 LZAR", status: "Completed", }, { date: "18 Aug 2025", customer: "Aisha K.", amount: "320 LZAR", status: "Pending", }, { date: "17 Aug 2025", customer: "Lerato P.", amount: "75 LZAR", status: "Completed", }, { date: "16 Aug 2025", customer: "Mike B.", amount: "500 LZAR", status: "Refunded", }, ];

	const getBadgeClasses = (status: string) => {
		switch (status) {
			case "Completed": return "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-50 border-green-200 dark:border-green-500";
			case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500 dark:text-yellow-950 border-yellow-200 dark:border-yellow-400";
			case "Refunded": return "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50 border-red-200 dark:border-red-500";
			default: return "bg-gray-100 text-gray-800 dark:bg-gray-500 dark:text-gray-50 border-gray-200 dark:border-gray-400";
		}
	};

	return (
		<div className="flex h-screen bg-white dark:bg-gradient-to-b dark:from-[#041827] dark:via-[#082733] dark:to-[#041827] text-gray-900 dark:text-gray-100">
			{/* Sidebar */}
			<aside className="w-64 bg-gray-100 dark:bg-[#031018] p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800">
				<div>
					<div className="flex items-center gap-3 mb-8">
						<Image src="/logo1.png" alt="ZarMate Logo" width={40} height={40} />
						<div className="font-semibold text-xl">ZarMate</div>
					</div>
					<nav className="flex flex-col gap-2">
						{navItems.map((item) => (
							<Button key={item.name} variant="ghost" onClick={() => setActiveItem(item.name)}
								className={`justify-start gap-3 px-3 transition-colors ${ activeItem === item.name ? "bg-cyan-500/10 text-cyan-600 dark:bg-[#072f39] dark:text-cyan-300" : "hover:bg-gray-200 dark:hover:bg-[#082733] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100" }`}
							>
								<item.icon size={18} /> {item.name}
							</Button>
						))}
					</nav>
				</div>
				<Button variant="ghost" className="justify-start gap-3 px-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#082733] hover:text-red-500 dark:hover:text-red-400">
					<LogOut size={18} /> Log Out
				</Button>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8 overflow-y-auto">
				{/* Header */}
				<header className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold">Merchant Dashboard</h1>
						<p className="text-gray-500 dark:text-gray-400">Welcome, The Coffee Shack!</p>
					</div>
					<div className="flex items-center gap-4">
						<ThemeToggle /> {/* <-- THEME TOGGLE ADDED HERE */}
						<div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-xl text-[#02202b]">CS</div>
					</div>
				</header>

				{/* ... (StatCards and Buttons remain the same, they are already theme-aware) ... */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<StatCard title="LZAR Balance" value="2,450" subtitle="≈ R2,450.00 ZAR" />
					<StatCard title="Pending Settlement" value="R850.00" />
					<Button className="h-full text-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#02202b] font-semibold flex flex-col gap-2 transition-transform hover:translate-y-[-2px]"> <Banknote size={32} /> Withdraw to Bank </Button>
					<Button className="h-full text-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#02202b] font-semibold flex flex-col gap-2 transition-transform hover:translate-y-[-2px]"> <QrCode size={32} /> Receive Payment </Button>
				</div>

				{/* Main Tabs */}
				<Tabs defaultValue="transactions">
					<TabsList className="bg-gray-100 dark:bg-[#072f39] border border-gray-200 dark:border-[#123a45]">
						<TabsTrigger value="transactions">Transactions</TabsTrigger>
						<TabsTrigger value="customers">Customers</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="receive">Receive Payment</TabsTrigger>
					</TabsList>

					{/* Transactions Tab */}
					<TabsContent value="transactions" className="mt-4">
						<Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
							<CardHeader>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<Input placeholder="Search by customer, amount..." className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45] focus:ring-cyan-400 pl-10" />
								</div>
							</CardHeader>
							<CardContent>
								<table className="w-full text-left">
									<thead className="bg-gray-50 dark:bg-[#041827]">
										<tr className="text-gray-500 dark:text-gray-400">
											<th className="p-4 font-medium">Date</th>
											<th className="p-4 font-medium">Customer</th>
											<th className="p-4 font-medium">Amount</th>
											<th className="p-4 font-medium">Status</th>
											<th className="p-4 font-medium text-right">Action</th>
										</tr>
									</thead>
									<tbody>
										{transactions.map((tx, i) => (
											<tr key={i} className="border-b border-gray-200 dark:border-[#123a45] even:bg-gray-50/50 dark:even:bg-[#072f39]/50 hover:bg-gray-50 dark:hover:bg-[#072f39]">
												<td className="p-4">{tx.date}</td>
												<td className="p-4">{tx.customer}</td>
												<td className="p-4 font-medium text-cyan-600 dark:text-cyan-300">{tx.amount}</td>
												<td className="p-4"><Badge className={getBadgeClasses(tx.status)}>{tx.status}</Badge></td>
												<td className="p-4 text-right"><Button size="sm" variant="outline" disabled={tx.status !== "Completed"}>Refund</Button></td>
											</tr>
										))}
									</tbody>
								</table>
							</CardContent>
						</Card>
					</TabsContent>
					{/* ... (Other TabsContent would also need theme-aware styling) ... */}
				</Tabs>
			</main>
		</div>
	);
}