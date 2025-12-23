import React, { useState, useEffect } from "react";
import {
  Activity,
  LogIn,
  HardHat,
  FileText,
  ShoppingBag,
  Loader,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "../libs/supabaseClient";

interface ActivityLogItem {
  id: string | number;
  timestamp: string;
  user: string;
  action: string;
  type: string;
}

const formatTime = (isoString: string) =>
  isoString
    ? new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "N/A";

const getLogIcon = (type: string) => {
  switch (type) {
    case "Auth":
      return <LogIn size={16} className="text-indigo-500" />;
    case "System":
      return <HardHat size={16} className="text-orange-500" />;
    case "Update":
      return <ShoppingBag size={16} className="text-blue-500" />;
    case "Create":
    case "Read":
      return <FileText size={16} className="text-green-500" />;
    default:
      return <Activity size={16} className="text-neutral-500" />;
  }
};

const getLogTypeClass = (type: string) => {
  switch (type) {
    case "Auth":
      return "bg-indigo-100 text-indigo-800";
    case "System":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-neutral-100 text-neutral-800";
  }
};

const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from<ActivityLogItem>("User_Activity_Logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50); // Fetch the most recent 50 logs

      if (error) throw error;

      setActivityLogs(data || []);
    } catch (e: any) {
      console.error("Supabase fetch error:", e);
      setError(
        `Failed to load activity logs: ${e.message}. Make sure the table "User_Activity_Logs" exists in Supabase.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-64 text-indigo-600 bg-white border rounded-xl shadow-lg">
        <Loader size={32} className="animate-spin mb-3" />
        <p className="text-lg font-medium">Fetching recent activity logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl w-full flex flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} />
        <p className="font-bold text-xl">Data Fetching Error</p>
        <p className="font-medium max-w-lg text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 flex items-center gap-2">
        <Activity size={28} />
        User Activity Logs
      </h2>

      <div className="p-4 bg-white border rounded-xl shadow-lg">
        <p className="text-lg font-medium mb-3 text-neutral-700">
          Recent System Events ({activityLogs.length} Records)
        </p>

        {activityLogs.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            No recent activity logs found.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {activityLogs.map((log) => (
              <li
                key={log.id}
                className="py-3 flex items-start space-x-3 hover:bg-neutral-50 px-2 rounded"
              >
                <div className="flex-shrink-0 mt-1">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {log.action}
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-600">
                      {log.user}
                    </span>{" "}
                    • {formatTime(log.timestamp)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogTypeClass(
                    log.type
                  )}`}
                >
                  {log.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
