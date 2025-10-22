import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return NextResponse.json([
    {
      id: "a1",
      type: "call",
      createdAt: new Date().toISOString(),
      durationSec: 42
    },
    {
      id: "a2",
      type: "note",
      createdAt: new Date().toISOString(),
      text: "Follow-up tomorrow"
    }
  ]);
}
