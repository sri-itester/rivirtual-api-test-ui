"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

type Lead = {
  id: number;
  salutation?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  mobile: string;
  leadStage: string;
  createdAt: string;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/leads")
      .then((res) => setLeads(res.data))
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleExportCSV() {
    const headers = ["Lead Name", "Email", "Phone", "Lead Stage", "Entry Date"];
    const rows = leads.map((l) => [
      `${l.salutation ? l.salutation + " " : ""}${l.firstName} ${l.lastName}`,
      l.email || "",
      l.mobile,
      l.leadStage || "",
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)
    return (
      <pre className="p-6 text-red-600">
        {JSON.stringify(error, null, 2)}
      </pre>
    );

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/leads/new")}
              className="px-4 py-2 rounded-md bg-rivGreen text-white hover:bg-rivGreenDark"
            >
              + Add New Lead
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) alert("CSV import will be implemented later");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Import (.csv)
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Export (.csv)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-rivGreen text-white">
                <th className="text-left px-4 py-3 font-medium">Lead Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Lead Stage</th>
                <th className="text-left px-4 py-3 font-medium">Lead Entry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/leads/${l.id}`)}
                >
                  <td className="px-4 py-3">
                    {(l.salutation ? l.salutation + " " : "") +
                      l.firstName +
                      " " +
                      l.lastName}
                  </td>
                  <td className="px-4 py-3">{l.email || "-"}</td>
                  <td className="px-4 py-3">{l.mobile}</td>
                  <td className="px-4 py-3">{l.leadStage || "-"}</td>
                  <td className="px-4 py-3">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
