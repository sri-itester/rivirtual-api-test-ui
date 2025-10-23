"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    whatsapp: "",
    leadType: "",
    preferredLanguage: "",
    companyName: "",
    country: "",
    state: "",
    city: "",
    leadStage: "Lead",
  });

  // handle changes
  function setField(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveLead() {
    setError("");

    // required validations
    if (!form.firstName || !form.lastName || !form.mobile || !form.country || !form.state || !form.city || !form.leadStage) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await api.post("/leads", form);
      router.push("/leads");
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add New Lead</h1>

      {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

      <div className="bg-white p-6 rounded border space-y-4">

        {/* SALUTATION */}
        <div>
          <label className="block text-sm mb-1">Salutation</label>
          <input className="border rounded w-full p-2"
                 value={form.salutation}
                 onChange={e => setField("salutation", e.target.value)} />
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name *</label>
            <input className="border rounded w-full p-2"
                   value={form.firstName}
                   onChange={e => setField("firstName", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name *</label>
            <input className="border rounded w-full p-2"
                   value={form.lastName}
                   onChange={e => setField("lastName", e.target.value)} />
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm mb-1">Email (optional)</label>
          <input className="border rounded w-full p-2"
                 value={form.email}
                 onChange={e => setField("email", e.target.value)} />
        </div>

        {/* MOBILE + WHATSAPP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Country Code</label>
            <input className="border rounded w-full p-2"
                   value={form.countryCode}
                   onChange={e => setField("countryCode", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Mobile *</label>
            <input className="border rounded w-full p-2"
                   value={form.mobile}
                   onChange={e => setField("mobile", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">WhatsApp</label>
            <input className="border rounded w-full p-2"
                   value={form.whatsapp}
                   onChange={e => setField("whatsapp", e.target.value)} />
          </div>
        </div>

        {/* Lead Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Lead Type</label>
            <select className="border rounded w-full p-2"
                    value={form.leadType}
                    onChange={e => setField("leadType", e.target.value)}>
              <option value="">Select</option>
              <option>Buyer</option>
              <option>Seller</option>
              <option>Owner</option>
              <option>Tenant</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Preferred Language</label>
            <input className="border rounded w-full p-2"
                   value={form.preferredLanguage}
                   onChange={e => setField("preferredLanguage", e.target.value)} />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm mb-1">Company Name</label>
          <input className="border rounded w-full p-2"
                 value={form.companyName}
                 onChange={e => setField("companyName", e.target.value)} />
        </div>

        {/* LOCATION */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Country *</label>
            <input className="border rounded w-full p-2"
                   value={form.country}
                   onChange={e => setField("country", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">State *</label>
            <input className="border rounded w-full p-2"
                   value={form.state}
                   onChange={e => setField("state", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">City *</label>
            <input className="border rounded w-full p-2"
                   value={form.city}
                   onChange={e => setField("city", e.target.value)} />
          </div>
        </div>

        {/* STAGE */}
        <div>
          <label className="block text-sm mb-1">Lead Stage *</label>
          <select className="border rounded w-full p-2"
                  value={form.leadStage}
                  onChange={e => setField("leadStage", e.target.value)}>
            <option>Lead</option>
            <option>Prospect</option>
            <option>Customer</option>
            <option>Disqualified</option>
            <option>Invalid</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => router.push("/leads")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={saveLead}
            className="px-4 py-2 rounded bg-rivGreen text-white hover:bg-rivGreenDark disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Lead"}
          </button>
        </div>

      </div>
    </div>
  );
}
