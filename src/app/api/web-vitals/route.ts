import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const metric = await request.json().catch(() => null);

  if (process.env.NODE_ENV === "development" && metric) {
    console.info("[web-vitals-api]", metric);
  }

  return NextResponse.json({ accepted: true }, { status: 202 });
}
