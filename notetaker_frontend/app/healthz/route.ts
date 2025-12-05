import { NextResponse } from "next/server";

// PUBLIC_INTERFACE
export async function GET() {
  /** Healthcheck endpoint: returns 200 OK with simple payload */
  return NextResponse.json({ status: "ok" });
}
