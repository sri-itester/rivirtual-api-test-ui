"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Stage = "Lead" | "Prospect" | "Customer" | "Disqualified" | "Invalid";
type LeadType = "Buyer" | "Seller" | "Owner" | "Tenant";

type Lead = {
  id: number;
  salutation?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  countryCode?: string | null;
  mobile: string;
  whatsapp?: string | null;
  leadType?: LeadType | "" | null;
  preferredLanguage?: string | null;
  companyName?: string | null;
  country: string;
  state: string;
  city: string;
  leadStage: Stage;
};

const STAGES: Stage[] = ["Lead", "Prospect", "Customer", "Disqualified", "Invalid"];
const TYPES: LeadType[] = ["Buyer", "Seller", "Owner", "Tenant"];

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();

  // In client components, useParams returns a plain object (Next 16).
  // Normalize to a number id:
  const leadId = useMemo(() => {
    const raw = (params as any)?.id;
    const s = Array.isArray(raw) ? raw[0] : String(raw ?? "");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [leadType, setLeadType] = useState<LeadType | "">("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [stage, setStage] = useState<Stage>("Lead");

  // Load existing lead
  useEffect(() => {
    if (!Number.isFinite(leadId)) {
      router.push("/leads");
      return;
    }
    setLoading(true);
    setError(null);

    api
      .get(`/leads/${leadId}`)
      .then((res) => {
        const l: Lead = res.data;
        setSalutation(l.salutation ?? "");
        setFirstName(l.firstName ?? "");
        setLastName(l.lastName ?? "");
        setEmail(l.email ?? "");
        setCountryCode(l.countryCode ?? "+91");
        setMobile(l.mobile ?? "");
        setWhatsapp(l.whatsapp ?? "");
        setLeadType((l.leadType as LeadType) ?? "");
        setPreferredLanguage(l.preferredLanguage ?? "");
        setCompanyName(l.companyName ?? "");
        setCountry(l.country ?? "");
        setStateName(l.state ?? "");
        setCity(l.city ?? "");
        setStage(l.leadStage ?? "Lead");
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e.message || "Failed to load lead.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [leadId, router]);

  // Keep WhatsApp in sync if checkbox is on
  useEffect(() => {
    if (sameWhatsapp) setWhatsapp(mobile);
  }, [sameWhatsapp, mobile]);

  // Simple required validation for DB-required fields
  const missing: string[] = [];
  if (!firstName.trim()) missing.push("First Name");
  if (!lastName.trim()) missing.push("Last Name");
  if (!mobile.trim()) missing.push("Mobile");
  if (!country.trim()) missing.push("Country");
  if (!stateName.trim()) missing.push("State");
  if (!city.trim()) missing.push("City");
  if (!stage) missing.push("Lead Stage");

  async function onSave() {
    if (!Number.isFinite(leadId)) return;
    if (missing.length) {
      alert(`Please fill required fields:\n- ${missing.join("\n- ")}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.put(`/leads/${leadId}`, {
        salutation: salutation || null,
        firstName,
        lastName,
        email: email || null, // email is optional in DB now
        countryCode,
        mobile,
        whatsapp: (sameWhatsapp ? mobile : whatsapp) || null,
        leadType: leadType || null,
        preferredLanguage: preferredLanguage || null,
        companyName: companyName || null,
        country,
        state: stateName,
        city,
        leadStage: stage,
      });

      // Redirect to detail page after save
      router.push(`/leads/${leadId}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || "Failed to save changes.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rivGreen border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.push("/leads")}
          className="px-3 py-2 border rounded"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/leads/${leadId}`)}
          className="text-rivGreen hover:underline"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/leads/${leadId}`)}
            className="px-4 py-2 border rounded"
            type="button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-rivGreen text-white hover:bg-rivGreenDark disabled:opacity-60"
            type="button"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold">Edit Lead</h1>

      {/* Contact Information */}
      <section className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Salutation" value={salutation} onChange={setSalutation} />

          <Field
            label="First Name *"
            value={firstName}
            onChange={setFirstName}
            required={!firstName.trim()}
          />

          <Field
            label="Last Name *"
            value={lastName}
            onChange={setLastName}
            required={!lastName.trim()}
          />

          <Field label="Email (optional)" type="email" value={email} onChange={setEmail} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Country Code" value={countryCode} onChange={setCountryCode} />
          <Field
            label="Mobile *"
            value={mobile}
            onChange={setMobile}
            required={!mobile.trim()}
          />
          <div>
            <Field
              label="WhatsApp Number"
              value={sameWhatsapp ? mobile : whatsapp}
              onChange={setWhatsapp}
              disabled={sameWhatsapp}
            />
            <label className="text-xs flex items-center gap-2 mt-1 text-gray-700">
              <input
                type="checkbox"
                checked={sameWhatsapp}
                onChange={(e) => setSameWhatsapp(e.target.checked)}
              />
              Same as mobile
            </label>
          </div>
        </div>
      </section>

      {/* Additional Details */}
      <section className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium">Additional Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Lead Type"
            value={leadType}
            onChange={(v) => setLeadType(v as LeadType | "")}
            options={TYPES}
          />
          <Field
            label="Preferred Language"
            value={preferredLanguage}
            onChange={setPreferredLanguage}
          />
          <Field label="Company Name" value={companyName} onChange={setCompanyName} />
        </div>
      </section>

      {/* Location */}
      <section className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium">Location</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Country *"
            value={country}
            onChange={setCountry}
            required={!country.trim()}
          />
          <Field
            label="State *"
            value={stateName}
            onChange={setStateName}
            required={!stateName.trim()}
          />
          <Field
            label="City *"
            value={city}
            onChange={setCity}
            required={!city.trim()}
          />
        </div>
      </section>

      {/* Stage */}
      <section className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-medium">Lead Stage</h2>
        <select
          className="mt-1 border rounded px-3 py-2 w-full"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage)}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      {/* Required fields helper */}
      {missing.length > 0 && (
        <div className="text-xs text-red-600">
          * Please complete required fields: {missing.join(", ")}
        </div>
      )}
    </div>
  );
}

/* ---------------- Helper Inputs ---------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <input
        type={type}
        disabled={disabled}
        className={[
          "mt-1 border rounded px-3 py-2 w-full",
          required ? "border-red-500" : "border-gray-300",
          disabled ? "bg-gray-100" : "",
        ].join(" ")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {required && <p className="mt-1 text-xs text-red-500">This field is required</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | "" | LeadType;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <select
        className="mt-1 border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
