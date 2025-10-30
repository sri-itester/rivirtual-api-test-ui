"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import ProtectedRoute from "@/components/ProtectedRoute";
import "react-datepicker/dist/react-datepicker.css";
import {
  ArrowLeft,
  EllipsisVertical,
  Phone,
  Clock,
  MessageCircle,
  Mail,
  StickyNote,
  User,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";

type LeadStage = "Lead" | "Prospect" | "Customer" | "Disqualified" | "Invalid";
type ActivityType = "NOTE" | "CALL" | "SMS" | "WHATSAPP" | "EMAIL" | "TASK";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  mobile: string;
  city?: string | null;
  state?: string | null;
  leadStage: LeadStage;
  assignedTo?: { id: number; name: string; email: string } | null;
}

interface Activity {
  id: number;
  type: ActivityType;
  content: any;
  createdAt: string;
  performedBy?: { name: string };
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = useMemo(() => Number(params.id), [params.id]);

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<"activity" | "tasks">("activity");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<null | ActivityType>(null);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [taskTime, setTaskTime] = useState<Date | null>(new Date());

  // 🧩 NEW: Track current integration mode (Manual / Cloud / AiSensy)
  const [integrationMode, setIntegrationMode] = useState("MANUAL");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [leadRes, actRes] = await Promise.all([
          api.get(`/leads/${leadId}`),
          api.get(`/leads/${leadId}/activities`),
        ]);
        setLead(leadRes.data);
        setActivities(actRes.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leadId]);

  // 🧩 NEW: Fetch integration mode once
  useEffect(() => {
    api
      .get("/integrations/config")
      .then((res) => setIntegrationMode(res.data.provider || "MANUAL"))
      .catch(() => setIntegrationMode("MANUAL"));
  }, []);

  async function logActivity(type: ActivityType, content: any) {
    try {
      const res = await api.post(`/leads/${leadId}/activities`, { type, content });
      setActivities((prev) => [res.data, ...prev]);
    } catch {
      toast.error("Failed to log activity");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await api.delete(`/leads/${leadId}`);
      toast.success("Lead deleted");
      router.push("/leads");
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/leads/${leadId}`);
    toast.success("Link copied!");
  }

  async function handleModalSubmit() {
    if (!lead) return;
    const number = lead.mobile.replace(/\D/g, "");
    const email = lead.email;
    const encodedMsg = encodeURIComponent(input.trim());

    try {
      switch (modal) {
        case "CALL":
          toast("📱 Open RiVirtual mobile app to continue the call");
          await logActivity("CALL", { number });
          break;
        case "TASK":
          if (taskTime) {
            await logActivity("TASK", { when: taskTime.toISOString(), note: input || "" });
            toast.success("Task scheduled");
          }
          break;
        case "WHATSAPP":
          try {
            const res = await api.post("/integrations/whatsapp", {
              leadId: lead.id,
              to: number,
              message: input,
            });

            const mode = res.data?.mode || "MANUAL";

            if (mode === "MANUAL") {
              window.open(`https://wa.me/${number}?text=${encodeURIComponent(input)}`, "_blank");
              toast.success("WhatsApp opened in manual mode");
            } else if (mode === "CLOUD") {
              toast.success("Message sent via Meta Cloud API ✅");
            } else if (mode === "AISENSY") {
              toast.success("Message sent via AiSensy API ✅");
            } else {
              toast("Message sent successfully");
            }

          } catch (err) {
            toast.error("Failed to send WhatsApp message");
            console.error(err);
          }
          break;

        case "SMS":
        try {
          await api.post("/integrations/sms", {
            leadId: lead.id,
            to: number.startsWith("+") ? number : `+91${number}`, // adjust as needed
            message: input,
          });

          await logActivity("SMS", { to: number, message: input });
          toast.success("SMS sent via Twilio ✅");
        } catch (err) {
          toast.error("Failed to send SMS");
          console.error(err);
        }
        break;


        case "EMAIL":
        if (!subject.trim()) {
          toast.error("Please enter a subject");
          return;
        }

        try {
          await api.post("/integrations/email", {
            leadId: lead.id,
            to: email,
            subject,
            body: input,
          });

          await logActivity("EMAIL", { to: email, subject, body: input });
          toast.success("Email sent via Resend API");
        } catch (err) {
          toast.error("Failed to send email");
          console.error(err);
        }
        break;


        case "NOTE":
          await logActivity("NOTE", { text: input });
          toast.success("Note added");
          break;
      }

      setModal(null);
      setInput("");
    } catch {
      toast.error("Failed to complete action");
    }
  }

  const now = new Date();

  const filteredActivities =
    activeTab === "tasks"
      ? activities
          .filter((a) => a.type === "TASK")
          .sort((a, b) => new Date(a.content.when).getTime() - new Date(b.content.when).getTime())
      : activities
          .filter((a) => a.type !== "TASK")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) return <div className="p-6">Loading...</div>;
  if (!lead) return <div className="p-6">Lead not found</div>;

  const displayName = `${lead.firstName} ${lead.lastName}`;

  return (
    <ProtectedRoute>
      <div className="p-5 space-y-6 bg-gray-50 min-h-screen">
        {/* Back */}
        <button
          onClick={() => router.push("/leads")}
          className="inline-flex items-center gap-2 text-rivGreen hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>

        {/* Header */}
        <div className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <div className="flex gap-2 items-center mt-1">
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                {lead.leadStage}
              </span>
              {lead.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" /> {lead.assignedTo.name}
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="p-2 rounded hover:bg-gray-100">
              <EllipsisVertical />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10 w-44">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => router.push(`/leads/${lead.id}/edit`)}
                >
                  Edit Lead
                </button>

                <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={copyLink}>
                  Copy Link
                </button>

                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => router.push("/settings/integrations")}
                >
                  Settings
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white border rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Mobile" value={lead.mobile} />
          <Field label="Email" value={lead.email || "-"} />
          <Field label="City" value={lead.city || "-"} />
          <Field label="State" value={lead.state || "-"} />
        </div>

        {/* Action Bar */}
        <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-6 text-center">
          <Action icon={<Phone className="text-blue-600" />} label="CALL" onClick={() => toast("📱 Open RiVirtual mobile app to continue the call")} />
          <Action icon={<Clock className="text-amber-600" />} label="CALL LATER" onClick={() => setModal("TASK")} />
          <Action icon={<MessageCircle className="text-green-600" />} label="WHATSAPP" onClick={() => setModal("WHATSAPP")} />
          <Action icon={<MessageCircle className="text-gray-600" />} label="SMS" onClick={() => setModal("SMS")} />
          <Action icon={<Mail className="text-indigo-600" />} label="EMAIL" onClick={() => setModal("EMAIL")} />
          <Action icon={<StickyNote className="text-pink-600" />} label="ADD NOTE" onClick={() => setModal("NOTE")} />
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-6 text-sm">
          <button
            className={`pb-2 ${activeTab === "activity" ? "border-b-2 border-rivGreen font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity History
          </button>
          <button
            className={`pb-2 ${activeTab === "tasks" ? "border-b-2 border-rivGreen font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </button>
        </div>

        {/* Activity & Tasks */}
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-6">
              No {activeTab === "tasks" ? "tasks" : "activities"} yet.
            </div>
          ) : (
            filteredActivities.map((a) => {
              const when = a.content?.when ? new Date(a.content.when) : null;
              const isTask = a.type === "TASK";
              const isOverdue = isTask && when && when < now;
              const isToday =
                isTask && when && Math.abs(when.getTime() - now.getTime()) < 6 * 60 * 60 * 1000;

              return (
                <div
                  key={a.id}
                  className={`rounded-lg p-3 border ${isTask ? "bg-gray-50" : "bg-white"}`}
                >
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{isTask ? "📅 Task" : "🗒️ " + a.type}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(a.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>

                  <div className="text-gray-700 text-sm mt-1">
                    {a.content?.text ||
                      a.content?.note ||
                      a.content?.message ||
                      JSON.stringify(a.content)}
                  </div>

                  {isTask && when && (
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div>
                        {isOverdue ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue ({format(when, "MMM d, h:mm a")})
                          </span>
                        ) : isToday ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" /> Today ({format(when, "h:mm a")})
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Upcoming ({format(when, "MMM d, h:mm a")})
                          </span>
                        )}
                      </div>

                      <button
                        className="text-xs text-rivGreen underline"
                        onClick={async () => {
                          await logActivity("NOTE", {
                            text: `✅ Task completed (${a.content?.note || ""})`,
                          });
                          toast.success("Task marked as done");
                          setActivities((prev) => prev.filter((t) => t.id !== a.id));
                        }}
                      >
                        Mark as Done
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {modal && modal !== "CALL" && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                {modal === "TASK" ? "Schedule Task" : `New ${modal}`}
              </h3>

              {/* 🧩 NEW: Show integration mode inside modal */}
              {modal === "WHATSAPP" && (
                <p className="text-xs text-gray-500 mb-2">
                  Using integration:{" "}
                  <span className="font-semibold text-gray-800">{integrationMode}</span>
                </p>
              )}
              {modal === "TASK" ? (
                <div className="space-y-3">
                  <label className="text-sm text-gray-500">When</label>
                  <DatePicker
                    selected={taskTime}
                    onChange={(d) => setTaskTime(d)}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="border rounded px-3 py-2 w-full"
                  />
                  <textarea
                    placeholder="Add note (optional)"
                    className="border rounded w-full p-2 text-sm h-20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              ) : modal === "EMAIL" ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter subject"
                    className="border rounded w-full p-2 text-sm"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <textarea
                    placeholder="Enter email body..."
                    className="border rounded w-full p-2 text-sm h-28"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              ) : (
                <textarea
                  placeholder="Enter message or note..."
                  className="border rounded w-full p-2 text-sm h-28"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              )}


              <div className="flex justify-end gap-3 mt-4">
                <button className="px-3 py-2 border rounded" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-rivGreen text-white hover:bg-rivGreenDark"
                  onClick={handleModalSubmit}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center hover:bg-gray-50 rounded-md p-2"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
