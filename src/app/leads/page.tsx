"use client";
import JsonDebug from "@/components/JsonDebug";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function LeadsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    api.get("/leads")
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <pre style={{color: "red"}}>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <h1>Lead List Page</h1>
      <ul>
        {data.map((lead: any) => (
          <li key={lead.id}>
            {lead.firstName} {lead.lastName} — {lead.mobile} — {lead.status}
          </li>
        ))}
      </ul>
      ,<JsonDebug />
    </div>
  );
}
