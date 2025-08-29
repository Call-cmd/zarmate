"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  Loader2,
} from "lucide-react";
import Image from "next/image";

// --- Data Types from our API ---
type OverviewStats = {
  lzarBalance: number;
  pendingSettlement: number;
  totalTransactions: number;
  uniqueCustomers: number;
};

type Transaction = {
  id: string;
  created_at: string;
  customer_handle: string | null;
  amount: string;
  status: "Completed" | "Pending" | "Refunded";
};

type Customer = {
  customer_handle: string;
  transaction_count: string;
  total_spent: string;
  last_seen: string;
};

// --- Components ---
const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) => (
  <Card className="bg-gray-50 dark:bg-[#082733] border-gray-200 dark:border-[#123a45] text-gray-900 dark:text-gray-100 transition-all hover:border-cyan-400/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-medium text-gray-500 dark:text-gray-300">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-400">{subtitle}</p>
      )}
    </CardContent>
  </Card>
);

export default function MerchantDashboard() {
  const [activeItem, setActiveItem] = useState("Overview");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "Receive Payment" tab
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeNotes, setChargeNotes] = useState("");
  const [generatedCharge, setGeneratedCharge] = useState<{
    id: string;
    qr: string;
  } | null>(null);

  // In a real app, this ID would come from an authentication context (e.g., Clerk, NextAuth)
  const merchantId = "merchant_cafe_789";
  const merchantHandle = "@campuscafe";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, transactionsRes, customersRes] = await Promise.all([
          fetch(
            `http://localhost:3000/api/dashboard/merchant/${merchantId}/overview`
          ),
          fetch(
            `http://localhost:3000/api/dashboard/merchant/${merchantId}/transactions`
          ),
          fetch(
            `http://localhost:3000/api/dashboard/merchant/${merchantId}/customers`
          ),
        ]);

        if (!statsRes.ok || !transactionsRes.ok || !customersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        const transactionsData = await transactionsRes.json();
        const customersData = await customersRes.json();

        setStats(statsData);
        setTransactions(transactionsData);
        setCustomers(customersData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [merchantId]);

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedCharge(null);
    try {
      const res = await fetch("http://localhost:3000/api/merchants/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: merchantHandle,
          amount: parseFloat(chargeAmount),
          notes: chargeNotes,
        }),
      });
      if (!res.ok) throw new Error("Failed to create charge");
      const data = await res.json();
      setGeneratedCharge({ id: data.chargeId, qr: data.qrContent });
      setChargeAmount("");
      setChargeNotes("");
    } catch (error) {
      console.error("Error creating charge:", error);
      alert("Failed to create payment request.");
    }
  };

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Transactions", icon: ArrowRightLeft },
    { name: "Customers", icon: Users },
    { name: "Analytics", icon: BarChart },
    { name: "Settings", icon: Settings },
  ];

  const getBadgeClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-50 border-green-200 dark:border-green-500";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500 dark:text-yellow-950 border-yellow-200 dark:border-yellow-400";
      case "Refunded":
        return "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50 border-red-200 dark:border-red-500";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500 dark:text-gray-50 border-gray-200 dark:border-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#041827]">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#041827] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gradient-to-b dark:from-[#041827] dark:via-[#082733] dark:to-[#041827] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-[#031018] p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800">
        {/* ... Sidebar content remains the same ... */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          {/* ... Header content remains the same ... */}
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="LZAR Balance"
            value={stats?.lzarBalance.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            }) || "R0.00"}
            subtitle={`Total Transactions: ${stats?.totalTransactions || 0}`}
          />
          <StatCard
            title="Pending Settlement"
            value={stats?.pendingSettlement.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            }) || "R0.00"}
            subtitle={`From ${stats?.uniqueCustomers || 0} customers`}
          />
          <Button className="h-full text-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#02202b] font-semibold flex flex-col gap-2 transition-transform hover:translate-y-[-2px]">
            <Banknote size={32} /> Withdraw to Bank
          </Button>
          <Button className="h-full text-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#02202b] font-semibold flex flex-col gap-2 transition-transform hover:translate-y-[-2px]">
            <QrCode size={32} /> Receive Payment
          </Button>
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
              <CardHeader>{/* ... Search Input ... */}</CardHeader>
              <CardContent>
                <table className="w-full text-left">
                  {/* ... Table Head ... */}
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-200 dark:border-[#123a45] even:bg-gray-50/50 dark:even:bg-[#072f39]/50 hover:bg-gray-50 dark:hover:bg-[#072f39]"
                        >
                          <td className="p-4">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">{tx.customer_handle || "N/A"}</td>
                          <td className="p-4 font-medium text-cyan-600 dark:text-cyan-300">
                            {parseFloat(tx.amount).toFixed(2)} LZAR
                          </td>
                          <td className="p-4">
                            <Badge className={getBadgeClasses(tx.status)}>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={tx.status !== "Completed"}
                            >
                              Refund
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardContent className="pt-6">
                <table className="w-full text-left">
                  {/* ... Table Head ... */}
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((c) => (
                        <tr
                          key={c.customer_handle}
                          className="border-b border-gray-200 dark:border-[#123a45] even:bg-gray-50/50 dark:even:bg-[#072f39]/50 hover:bg-gray-50 dark:hover:bg-[#072f39]"
                        >
                          <td className="p-4 font-semibold">
                            {c.customer_handle}
                          </td>
                          <td className="p-4">{c.transaction_count}</td>
                          <td className="p-4 font-medium text-cyan-600 dark:text-cyan-300">
                            {parseFloat(c.total_spent).toFixed(2)} LZAR
                          </td>
                          <td className="p-4">
                            {new Date(c.last_seen).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No customer data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receive Payment Tab */}
          <TabsContent value="receive" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardHeader>
                <CardTitle>Create a New Payment Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCharge} className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount (e.g., 25.50)"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    required
                    step="0.01"
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45]"
                  />
                  <Input
                    type="text"
                    placeholder="Notes (e.g., Coffee and a Muffin)"
                    value={chargeNotes}
                    onChange={(e) => setChargeNotes(e.target.value)}
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45]"
                  />
                  <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600">
                    Generate Payment Code
                  </Button>
                </form>
                {generatedCharge && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-[#041827] rounded-lg text-center">
                    <p className="font-semibold">Payment Code Generated!</p>
                    <p className="text-sm text-gray-500">
                      A customer can pay this by sending the following command on WhatsApp:
                    </p>
                    <code className="block mt-2 p-2 bg-gray-200 dark:bg-black rounded font-mono text-cyan-600 dark:text-cyan-300">
                      {generatedCharge.qr}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}