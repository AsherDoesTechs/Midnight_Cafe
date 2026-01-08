import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  Loader,
  AlertTriangle,
  Download,
  DollarSign,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { supabase } from "../libs/supabaseClient";

/* ===================== TYPES ===================== */

interface AnalyticsData {
  month: string;
  revenue: number;
  sales: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subValue?: string;
}

// Added interface for Supabase Order response
interface SupabaseOrderResponse {
  created_at: string;
  total_amount: number | null;
  status: string | null;
  payment_status: string | null;
}

/* ===================== SUB-COMPONENTS ===================== */

const KPICard = ({
  title,
  value,
  icon: Icon,
  color,
  subValue,
}: KPICardProps) => (
  <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-neutral-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
        {subValue && (
          <p className="text-xs text-neutral-400 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  </div>
);

const RevenueBarChart = ({ data }: { data: AnalyticsData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        fontSize={12}
        tick={{ fill: "#9ca3af" }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        fontSize={12}
        tick={{ fill: "#9ca3af" }}
        tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
      />
      <Tooltip
        cursor={{ fill: "#f9fafb" }}
        contentStyle={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
        formatter={(
          value: number | string | (number | string)[] | undefined
        ) => {
          const numValue = value ? Number(value) : 0;
          return [`₱${numValue.toLocaleString()}`, "Revenue"];
        }}
      />
      <Bar
        dataKey="revenue"
        fill="#4f46e5"
        radius={[6, 6, 0, 0]}
        barSize={35}
      />
    </BarChart>
  </ResponsiveContainer>
);

const SalesLineChart = ({ data }: { data: AnalyticsData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        fontSize={12}
        tick={{ fill: "#9ca3af" }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        fontSize={12}
        tick={{ fill: "#9ca3af" }}
      />
      <Tooltip
        contentStyle={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
        formatter={(
          value: number | string | (number | string)[] | undefined
        ) => {
          const numValue = value ? Number(value) : 0;
          return [numValue.toLocaleString(), "Orders"];
        }}
      />
      <Legend verticalAlign="top" height={36} iconType="circle" />
      <Line
        type="monotone"
        dataKey="sales"
        stroke="#10b981"
        strokeWidth={4}
        dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
        activeDot={{ r: 8 }}
        name="Orders"
      />
    </LineChart>
  </ResponsiveContainer>
);

/* ===================== MAIN COMPONENT ===================== */

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("combined_orders")
        .select(`created_at, total_amount, status, payment_status`);

      if (filterMonth) {
        const start = new Date(filterMonth + "-01");
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        query = query
          .gte("created_at", start.toISOString())
          .lt("created_at", end.toISOString());
      } else if (filterYear) {
        const start = new Date(`${filterYear}-01-01T00:00:00Z`);
        const end = new Date(`${filterYear}-12-31T23:59:59Z`);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const monthlyMap: Record<string, { revenue: number; sales: number }> = {};

      // Type-safe iteration over Supabase data
      (data as unknown as SupabaseOrderResponse[])?.forEach((order) => {
        const isPaid = order.payment_status?.toLowerCase() === "paid";
        const isCompleted = order.status?.toLowerCase() === "completed";

        if (!isPaid && !isCompleted) return;

        const date = new Date(order.created_at);
        const monthKey = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyMap[monthKey])
          monthlyMap[monthKey] = { revenue: 0, sales: 0 };

        monthlyMap[monthKey].revenue += Number(order.total_amount || 0);
        monthlyMap[monthKey].sales += 1;
      });

      const formattedData: AnalyticsData[] = Object.entries(monthlyMap)
        .map(([month, values]) => ({
          month,
          revenue: values.revenue,
          sales: values.sales,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

      setSalesData(formattedData);
    } catch (err) {
      // FIX: Safe error message handling
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => {
    const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalSales = salesData.reduce((acc, curr) => acc + curr.sales, 0);
    return {
      totalRevenue,
      totalSales,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }, [salesData]);

  const exportCSV = () => {
    const csvContent = [
      ["Month", "Revenue", "Orders"],
      ...salesData.map((d) => [
        d.month,
        d.revenue.toString(),
        d.sales.toString(),
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-neutral-500 font-medium">
          Analyzing revenue trends...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Sales Analytics
          </h2>
          <p className="text-neutral-500 font-medium">
            Aggregated revenue data from all order types
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border p-1.5 rounded-xl shadow-sm">
            <Calendar size={16} className="text-neutral-400 ml-2" />
            <input
              type="month"
              className="text-sm font-medium outline-none bg-transparent mr-2"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterYear("");
              }}
            />
            <input
              type="number"
              placeholder="Year"
              className="text-sm font-medium outline-none bg-transparent w-16 border-l pl-2"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setFilterMonth("");
              }}
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={`₱${kpis.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-indigo-600"
          subValue="Gross Earnings"
        />
        <KPICard
          title="Total Orders"
          value={kpis.totalSales}
          icon={ShoppingCart}
          color="bg-emerald-500"
          subValue="Successful Sales"
        />
        <KPICard
          title="Avg. Order Value"
          value={`₱${kpis.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-orange-500"
          subValue="Ticket Average"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="font-bold text-neutral-800 text-lg mb-6">
            Revenue Growth
          </h3>
          <RevenueBarChart data={salesData} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="font-bold text-neutral-800 text-lg mb-6">
            Order Trends
          </h3>
          <SalesLineChart data={salesData} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50 bg-neutral-50/30">
          <h3 className="font-bold text-neutral-800">
            Monthly Performance Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-8 py-4">Reporting Month</th>
                <th className="px-8 py-4 text-right">Total Revenue</th>
                <th className="px-8 py-4 text-right">Transactions</th>
                <th className="px-8 py-4 text-right">Avg Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {salesData.map((row) => (
                <tr
                  key={row.month}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-8 py-5 text-sm font-bold text-neutral-700">
                    {row.month}
                  </td>
                  <td className="px-8 py-5 text-sm text-right font-semibold text-indigo-600">
                    ₱{row.revenue.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-sm text-right text-neutral-600">
                    {row.sales}
                  </td>
                  <td className="px-8 py-5 text-sm text-right">
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                      ₱
                      {row.sales > 0
                        ? (row.revenue / row.sales).toFixed(0)
                        : "0"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
