import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  LogIn,
  HardHat,
  FileText,
  Loader,
  AlertTriangle,
  RotateCcw,
  Download,
  ShieldCheck,
  User as UserIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

import { supabase } from "../libs/supabaseClient";

/* ===================== TYPES ===================== */
interface ActivityLogItem {
  id: number;
  action_description: string;
  user_id: string;
  timestamp: string;
  log_type: string;
}

/* ===================== SUB-COMPONENTS ===================== */

const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
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

/* ===================== MAIN COMPONENT ===================== */

const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // CONTROL STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
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
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, filterType]
  );

  // REAL-TIME AUTO-SYNC
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
      {/* HEADER */}
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
            Monitoring real-time system and security events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center bg-white border p-1.5 rounded-xl shadow-sm">
            <Search size={16} className="text-neutral-400 ml-2" />
            <input
              type="text"
              placeholder="Search actions..."
              className="text-sm font-medium outline-none bg-transparent px-2 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="text-sm font-bold text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg border-l outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Auth">Auth</option>
              <option value="System">System</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
          >
            <Download size={18} /> Export
          </button>

          <button
            onClick={() => fetchData(true)}
            className={`p-2 rounded-xl border bg-white text-neutral-400 hover:text-neutral-600 transition-all ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
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

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 font-bold text-sm">
          <AlertTriangle size={20} />
          <span>Sync Error: {error}</span>
        </div>
      )}

      {/* LOG TABLE */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50 bg-neutral-50/30 flex justify-between items-center">
          <h3 className="font-bold text-neutral-800">
            Verified Activity Trail
          </h3>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {activityLogs.length > 0
              ? "Real-time Monitoring Active"
              : "No Records Found"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-8 py-4">Event Description</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Operator Trace</th>
                <th className="px-8 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-neutral-800">
                      {log.action_description}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
                        log.log_type.includes("Auth")
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-neutral-50 text-neutral-600 border-neutral-100"
                      }`}
                    >
                      <Zap size={10} /> {log.log_type || "General"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 group/id">
                      <UserIcon size={14} className="text-neutral-300" />
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded blur-[3px] group-hover/id:blur-none transition-all cursor-help duration-300">
                        {log.user_id || "SYSTEM_DAEMON"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-xs font-bold text-neutral-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p className="text-[10px] text-neutral-300 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 bg-neutral-50/50 border-t flex items-center justify-between">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Page <span className="text-indigo-600">{page + 1}</span> of Buffer
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-white border rounded-lg hover:bg-neutral-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={activityLogs.length < ROWS_PER_PAGE}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-white border rounded-lg hover:bg-neutral-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
