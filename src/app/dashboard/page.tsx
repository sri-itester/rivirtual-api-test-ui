"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ClipboardList, Users, Clock, CheckCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Summary {
  totalLeads: number;
  leadsByStage: { stage: string; count: number }[];
  recentActivities: number;
  upcomingTasks: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/analytics/summary")
      .then((res) => {
    const data = res.data;

    // Ensure leadsByStage is always an array
    const leadsByStage = Array.isArray(data.leadsByStage)
      ? data.leadsByStage
      : Object.entries(data.leadsByStage || {}).map(([stage, count]) => ({
          stage,
          count: Number(count),
        }));

    setSummary({
      ...data,
      leadsByStage,
    });
  })
  .catch((e) => console.error("Dashboard fetch failed:", e))
  .finally(() => setLoading(false));

  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!summary) return <div className="p-6 text-red-500">Failed to load data.</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-semibold mb-4">Analytics Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card
  icon={<Users className="text-blue-600" />}
  title="Total Leads"
  value={summary.totalLeads}
  onClick={() => router.push("/leads")}
/>
<Card
  icon={<ClipboardList className="text-green-600" />}
  title="Recent Activities (7d)"
  value={summary.recentActivities}
  onClick={() => router.push("/leads?tab=activity")}
/>
<Card
  icon={<Clock className="text-amber-600" />}
  title="Upcoming Tasks"
  value={summary.upcomingTasks}
  onClick={() => router.push("/leads?tab=tasks")}
/>
<Card
  icon={<CheckCircle className="text-indigo-600" />}
  title="Active Stages"
  value={summary.leadsByStage.length}
  onClick={() => router.push("/leads?tab=stages")}
/>

        </div>

        {/* Leads by Stage Chart */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Leads by Stage</h2>
          {summary.leadsByStage.length === 0 ? (
            <div className="text-gray-500 text-sm">No leads data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.leadsByStage}>
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Card({
  icon,
  title,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl shadow-sm p-5 flex items-center gap-3 cursor-pointer transition hover:shadow-md hover:border-rivGreen ${
        onClick ? "hover:bg-green-50" : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
    >
      <div className="p-2 bg-gray-50 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
