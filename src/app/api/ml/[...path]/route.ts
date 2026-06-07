import { NextRequest, NextResponse } from "next/server";

/**
 * ML API Proxy Route
 * ==================
 * Proxies all requests from the frontend to the ML backend,
 * bypassing browser CORS restrictions. The backend only allows
 * localhost origins, so Vercel-deployed frontend must go through
 * this server-side proxy.
 *
 * Usage:  /api/ml/health        → https://nestrag.duckdns.org/ml/api/v1/health
 *         /api/ml/predict       → https://nestrag.duckdns.org/ml/api/v1/predict
 *         /api/ml/ranking       → https://nestrag.duckdns.org/ml/api/v1/ranking
 *         /api/ml/predict/locations → ...
 */

const ML_BACKEND = "https://nestrag.duckdns.org/ml/api/v1";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const targetUrl = `${ML_BACKEND}/${subPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for non-GET requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      fetchOptions.body = await request.text();
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ML backend unreachable";
    return NextResponse.json(
      { detail: message },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
