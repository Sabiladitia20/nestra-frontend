import { NextResponse } from "next/server";
import { API_PREFIX } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_PREFIX}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errData?.detail || `Backend error ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
