"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
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
  Settings,
  QrCode,
  Banknote,
  LogOut,
  Loader2,
  BarChart as BarChartIcon, // Renamed icon to avoid conflict
} from "lucide-react";
import Image from "next/image";
import {
  BarChart, // <-- CORRECT: This is the chart component from recharts
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- Data Types ---
type AnalyticsData = { date: string; total: number };
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
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // --- ALL STATE IN ONE PLACE ---
  const [activeItem, setActiveItem] = useState("Overview");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [communityFund, setCommunityFund] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeNotes, setChargeNotes] = useState("");
  const [generatedCharge, setGeneratedCharge] = useState<{
    id: string;
    qr: string;
  } | null>(null);
  const [couponTitle, setCouponTitle] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState("");

  // --- ONE UNIFIED useEffect FOR ALL DATA FETCHING ---
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }

    if (user && token) {
      const merchantId = user.id;
      async function fetchData() {
        setDataLoading(true);
        setError(null);
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [
            statsRes,
            transactionsRes,
            customersRes,
            fundRes,
            analyticsRes,
          ] = await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/merchant/${merchantId}/overview`,
              { headers }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/merchant/${merchantId}/transactions`,
              { headers }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/merchant/${merchantId}/customers`,
              { headers }
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/community-fund`, {
              headers,
            }),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/merchant/${merchantId}/analytics`,
              { headers }
            ),
          ]);

          if (
            !statsRes.ok ||
            !transactionsRes.ok ||
            !customersRes.ok ||
            !fundRes.ok ||
            !analyticsRes.ok
          ) {
            throw new Error("Failed to fetch dashboard data");
          }

          setStats(await statsRes.json());
          setTransactions(await transactionsRes.json());
          setCustomers(await customersRes.json());
          setCommunityFund((await fundRes.json()).balance);
          setAnalyticsData(await analyticsRes.json());
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setDataLoading(false);
        }
      }
      fetchData();
    }
  }, [user, token, authLoading, router]);

  // --- ALL HANDLER FUNCTIONS ---
  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    setGeneratedCharge(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/merchants/charges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          merchantId: user.handle,
          amount: parseFloat(chargeAmount),
          notes: chargeNotes,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create charge");
      }
      const data = await res.json();
      setGeneratedCharge({ id: data.chargeId, qr: data.qrContent });
      setChargeAmount("");
      setChargeNotes("");
    } catch (error) {
      console.error("Error creating charge:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create payment request."
      );
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    setCouponStatus("Creating coupon...");
    try {
      const payload = {
        title: couponTitle,
        description: couponDesc,
        code: couponCode,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/merchant/${user.id}/coupons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create coupon");
      }
      setCouponStatus("✅ Coupon created successfully!");
      setCouponTitle("");
      setCouponDesc("");
      setCouponCode("");
    } catch (error) {
      setCouponStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "Failed to create coupon."
      );
    }
  };

  const getBadgeClasses = (status: string): string => {
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

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Transactions", icon: ArrowRightLeft },
    { name: "Customers", icon: Users },
    { name: "Analytics", icon: BarChartIcon },
    { name: "Settings", icon: Settings },
  ];

  if (authLoading || dataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#041827]">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gradient-to-b dark:from-[#041827] dark:via-[#082733] dark:to-[#041827] text-gray-900 dark:text-gray-100">
      <aside className="w-64 bg-gray-100 dark:bg-[#031018] p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo1.png" alt="ZarMate Logo" width={40} height={40} />
            <div className="font-semibold text-xl">ZarMate</div>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => setActiveItem(item.name)}
                className={`justify-start gap-3 px-3 transition-colors ${
                  activeItem === item.name
                    ? "bg-cyan-500/10 text-cyan-600 dark:bg-[#072f39] dark:text-cyan-300"
                    : "hover:bg-gray-200 dark:hover:bg-[#082733] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <item.icon size={18} /> {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="justify-start gap-3 px-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#082733] hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut size={18} /> Log Out
        </Button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome, {user.handle}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-xl text-[#02202b]">
              {user.handle.substring(1, 3).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="LZAR Balance"
            value={
              stats?.lzarBalance.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              }) || "R0.00"
            }
            subtitle={`From ${stats?.totalTransactions || 0} total transactions`}
          />
          <StatCard
            title="Pending Settlement"
            value={
              stats?.pendingSettlement.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              }) || "R0.00"
            }
            subtitle={`From ${stats?.uniqueCustomers || 0} unique customers`}
          />
          <StatCard
            title="Community Fund"
            value={communityFund.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}
            subtitle="Funded by user round-ups"
          />
          <Button className="h-full text-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#02202b] font-semibold flex flex-col gap-2 transition-transform hover:translate-y-[-2px]">
            <QrCode size={32} /> Receive Payment
          </Button>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList className="bg-gray-100 dark:bg-[#072f39] border border-gray-200 dark:border-[#123a45]">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="receive">Receive Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardHeader>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Search by customer, amount..."
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45] focus:ring-cyan-400 pl-10"
                  />
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
                        <td
                          colSpan={5}
                          className="p-8 text-center text-gray-500"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardContent className="pt-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-[#041827]">
                    <tr className="text-gray-500 dark:text-gray-400">
                      <th className="p-4 font-medium">Customer Handle</th>
                      <th className="p-4 font-medium"># of Transactions</th>
                      <th className="p-4 font-medium">Total Spent</th>
                      <th className="p-4 font-medium">Last Seen</th>
                    </tr>
                  </thead>
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
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-500"
                        >
                          No customer data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardHeader>
                <CardTitle>Daily Sales Volume</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] w-full">
                {analyticsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(128, 128, 128, 0.2)"
                      />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#031018",
                          borderColor: "#123a45",
                        }}
                        labelStyle={{ color: "#cbd5e1" }}
                        formatter={(value) => [
                          `R${Number(value).toFixed(2)}`,
                          "Sales",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        name="Daily Sales (LZAR)"
                        fill="#22d3ee"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Not enough transaction data to display a chart.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                  <Button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Generate Payment Code
                  </Button>
                </form>
                {generatedCharge && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-[#041827] rounded-lg text-center">
                    <p className="font-semibold">Payment Code Generated!</p>
                    <div className="my-4 flex justify-center bg-white p-4 rounded-lg max-w-xs mx-auto">
                      <QRCodeSVG
                        value={generatedCharge.qr}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Have the customer scan this code, or send the following
                      command on WhatsApp:
                    </p>
                    <code className="block mt-2 p-2 bg-gray-200 dark:bg-black rounded font-mono text-cyan-600 dark:text-cyan-300">
                      {generatedCharge.qr}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="mt-4">
            <Card className="bg-white dark:bg-[#082733] border-gray-200 dark:border-[#123a45]">
              <CardHeader>
                <CardTitle>Create a New Coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Coupon Title (e.g., Free Coffee)"
                    value={couponTitle}
                    onChange={(e) => setCouponTitle(e.target.value)}
                    required
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45]"
                  />
                  <Input
                    type="text"
                    placeholder="Description (e.g., Get one free small coffee)"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    required
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45]"
                  />
                  <Input
                    type="text"
                    placeholder="Unique Code (e.g., ZARCOFFEE)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    required
                    className="bg-gray-50 dark:bg-[#041827] border-gray-200 dark:border-[#123a45]"
                  />
                  <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600">
                    Create Coupon
                  </Button>
                  {couponStatus && <p className="text-center text-sm mt-2">{couponStatus}</p>}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}