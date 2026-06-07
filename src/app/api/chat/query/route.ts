import { NextResponse } from "next/server";

// RAG query service lives at root, separate from ML API (/ml/api/v1)
const RAG_URL = "https://nestrag.duckdns.org/query";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(RAG_URL, {
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
