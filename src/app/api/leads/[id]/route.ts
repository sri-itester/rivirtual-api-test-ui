import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap here

  return NextResponse.json({
    id,
    firstName: "John",
    lastName: "Doe",
    mobile: "+911234567890",
    status: "Lead",
    source: "Manual"
  });
}
