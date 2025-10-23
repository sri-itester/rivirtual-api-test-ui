"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  EllipsisVertical,
  Phone,
  Mail,
  User,
  Copy,
  Trash2,
} from "lucide-react";

type Lead = {
  id: number;
  salutation?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  mobile: string;
  leadStage: "Lead" | "Prospect" | "Customer" | "Disqualified" | "Invalid";
  createdAt: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = useMemo(() => Number(params.id), [params.id]);

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/leads/${leadId}`)
      .then((res) => setLead(res.data))
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  const displayName = `${lead?.salutation ? lead.salutation + " " : ""}${lead?.firstName} ${lead?.lastName}`.trim();

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!lead) return <div className="p-6">Lead not found</div>;

  return (
    <div className="p-5 space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push("/leads")}
        className="inline-flex items-center gap-2 text-rivGreen hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      {/* Header */}
      <div className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
            {lead.leadStage}
          </span>
        </div>

        <button onClick={() => router.push(`/leads/${lead.id}/edit`)}>
          <EllipsisVertical />
        </button>
      </div>

      {/* Overview */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <Field icon={<User className="w-4 h-4" />} label="Full Name" value={displayName} />
          <Field icon={<Phone className="w-4 h-4" />} label="Mobile" value={lead.mobile} />
          <Field icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email || "-"} />

          {/* ✅ ADDED ASSIGNED TO */}
          <Field
            icon={<User className="w-4 h-4" />}
            label="Assigned To"
            value={lead.assignedTo?.name || "-"}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div>
      <div className="text-gray-500 flex items-center gap-1 text-xs mb-1">
        {icon} <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-800">{value || "-"}</div>
    </div>
  );
}
