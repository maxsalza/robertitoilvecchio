import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const date = new Date(dateParam);
  const slots = await getAvailableSlots(date);

  return NextResponse.json({ slots });
}
