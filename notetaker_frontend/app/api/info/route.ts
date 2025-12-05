import { NextResponse } from "next/server";

// PUBLIC_INTERFACE
export async function GET() {
  /** Returns basic app info to verify API routes work without backend dependency */
  return NextResponse.json({
    name: "notetaker-frontend",
    version: "0.1.0",
    status: "ok"
  });
}
