import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LogIn,
  HardHat,
  Loader,
  AlertTriangle,
  RotateCcw,
  Download,
  ShieldCheck,
  Search,
  Zap,
} from "lucide-react";
import { supabase } from "../libs/supabaseClient";

interface ActivityLogItem {
  id: number;
  action_description: string;
  user_id: string;
  timestamp: string;
  log_type: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  subValue?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subValue,
}: StatCardProps) => (
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

const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType] = useState("all");
  const [page] = useState(0);
  const ROWS_PER_PAGE = 10;

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        let query = supabase
          .from("user_activity_logs")
          .select("*", { count: "exact" })
          .order("timestamp", { ascending: false });

        if (filterType !== "all") {
          query = query.ilike("log_type", `%${filterType}%`);
        }

        const { data, error: fetchError } = await query.range(
          page * ROWS_PER_PAGE,
          (page + 1) * ROWS_PER_PAGE - 1
        );

        if (fetchError) throw fetchError;
        setActivityLogs((data as ActivityLogItem[]) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, filterType]
  );

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("live_security_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_activity_logs" },
        (payload) => {
          setActivityLogs((current) =>
            [payload.new as ActivityLogItem, ...current].slice(0, 50)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) =>
      log.action_description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activityLogs, searchTerm]);

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Action", "Type", "User ID", "Timestamp"],
      ...activityLogs.map((l) => [
        l.id,
        l.action_description,
        l.log_type,
        l.user_id,
        l.timestamp,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `security_audit_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-neutral-500 font-medium">
          Establishing secure audit feed...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header and Table remains the same as your original UI logic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              System Audit Logs
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Live Sync
              </span>
            </div>
          </div>
          <p className="text-neutral-500 font-medium">
            Monitoring real-time events
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center bg-white border p-1.5 rounded-xl shadow-sm">
            <Search size={16} className="text-neutral-400 ml-2" />
            <input
              className="text-sm font-medium outline-none bg-transparent px-2 w-48"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => fetchData(true)}
            className={`p-2 rounded-xl border bg-white text-neutral-400 transition-all ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Security Events"
          value={activityLogs.length}
          icon={ShieldCheck}
          color="bg-indigo-600"
          subValue="Current Buffer"
        />
        <StatCard
          title="Auth Actions"
          value={activityLogs.filter((l) => l.log_type.includes("Auth")).length}
          icon={LogIn}
          color="bg-emerald-500"
          subValue="Logins & Sessions"
        />
        <StatCard
          title="System Alerts"
          value={
            activityLogs.filter((l) => l.log_type.includes("System")).length
          }
          icon={HardHat}
          color="bg-orange-500"
          subValue="Core Operations"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 font-bold text-sm">
          <AlertTriangle size={20} />
          <span>Sync Error: {error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-8 py-4">Event Description</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Operator</th>
                <th className="px-8 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="px-8 py-5 text-sm font-bold text-neutral-800">
                    {log.action_description}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        log.log_type.includes("Auth")
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-neutral-50 text-neutral-600 border-neutral-100"
                      }`}
                    >
                      <Zap size={10} /> {log.log_type || "General"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-neutral-500">
                      {log.user_id || "SYSTEM"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right tabular-nums text-xs text-neutral-400">
                    {new Date(log.timestamp).toLocaleString()}
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

export default ActivityLogs;
