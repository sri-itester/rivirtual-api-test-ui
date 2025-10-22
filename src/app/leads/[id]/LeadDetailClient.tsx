"use client";
import JsonDebug from "@/components/JsonDebug";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function LeadDetailClient({ id }: { id: string }) {
  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/leads/${id}`),
      api.get(`/leads/${id}/activities`),
    ])
      .then(([resLead, resAct]) => {
        setLead(resLead.data);
        setActivities(resAct.data);
      })
      .catch(err => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <pre style={{color:"red"}}>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <h1>Lead Detail — {lead.firstName} {lead.lastName}</h1>
      <p>Mobile: {lead.mobile}</p>
      <p>Status: {lead.status}</p>

      <h2>Activities</h2>
      <ul>
        {activities.map(a => (
          <li key={a.id}>{a.type} — {a.createdAt}</li>
        ))}
      </ul>
      <JsonDebug />
    </div>
  );
}
