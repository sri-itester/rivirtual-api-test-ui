// src/app/leads/[id]/page.tsx
import LeadDetailClient from "./LeadDetailClient";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return <LeadDetailClient id={params.id} />;
}
