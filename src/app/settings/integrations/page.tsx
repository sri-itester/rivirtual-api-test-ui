"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

type Provider = "MANUAL" | "CLOUD" | "AISENSY";

export default function IntegrationSettingsPage() {
  const [provider, setProvider] = useState<Provider>("MANUAL");
  const [apiKey, setApiKey] = useState("");
  const [apiBase, setApiBase] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [senderId, setSenderId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    api
      .get("/integrations/config")
      .then((res) => {
        const c = res.data;
        setProvider(c.provider);
        setApiKey(c.whatsappApiKey || "");
        setApiBase(c.apiBase || "");
        setCampaignName(c.campaignName || "");
        setSenderId(c.whatsappSender || "");
      })
      .catch(() => toast.error("Failed to load integration config"))
      .finally(() => setLoading(false));
  }, []);

  function handleProviderChange(value: Provider) {
    setProvider(value);
    if (value === "MANUAL") {
      setApiKey("");
      setApiBase("");
      setCampaignName("");
      setSenderId("");
    } else if (value === "CLOUD") {
      setApiBase("");
      setCampaignName("");
    } else if (value === "AISENSY") {
      setSenderId("");
    }
  }

  async function handleSave() {
    try {
      // Validation
      if (provider === "CLOUD" && (!apiKey || !senderId))
        return toast.error("Please fill Cloud API Key and Phone ID");
      if (provider === "AISENSY" && (!apiKey || !apiBase || !campaignName))
        return toast.error("Please fill all AiSensy fields");

      setSaving(true);
      await api.put("/integrations/config", {
        provider,
        apiKey,
        apiBase,
        campaignName,
        senderId,
      });
      toast.success("Integration settings updated!");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  // 🧩 Test Connection (auto-save if success)
  async function handleTest() {
    try {
      toast.loading("Testing connection...", { id: "test" });
      const res = await api.post("/integrations/test");
      toast.success(res.data.message || "Connection successful", { id: "test" });
      await handleSave(); // auto-save on success
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Test failed", { id: "test" });
    }
  }

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Integration Settings</h1>
        <p className="text-gray-600 text-sm">
          Configure your WhatsApp integration for this CRM.
        </p>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Provider
            </label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              <option value="MANUAL">Manual (open WhatsApp Web)</option>
              <option value="CLOUD">Meta Cloud API</option>
              <option value="AISENSY">AiSensy API</option>
            </select>
          </div>

          {/* CLOUD */}
          {provider === "CLOUD" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  API Key
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter Meta API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number ID
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  placeholder="Enter Meta Phone Number ID"
                />
              </div>
            </>
          )}

          {/* AISENSY */}
          {provider === "AISENSY" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  AiSensy API Key
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter AiSensy API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  API Base URL
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder="https://backend.api-wa.co/campaign/.../api/v2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Name
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. welcome_text"
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleTest}
              disabled={saving}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-60"
            >
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-rivGreen text-white rounded hover:bg-rivGreenDark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
