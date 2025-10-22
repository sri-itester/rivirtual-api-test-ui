import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "1", firstName: "John", lastName: "Doe", mobile: "+911234567890", status: "Lead" },
    { id: "2", firstName: "Asha", lastName: "K", mobile: "+919876543210", status: "Prospect" }
  ]);
}
