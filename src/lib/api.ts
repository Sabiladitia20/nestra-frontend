/**
 * Dashboard Mahi — AI Backend API Client
 * ========================================
 * Type-safe API client for communicating with the FastAPI backend.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  model: string;
  tokens_used: number | null;
  processing_time_ms: number | null;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface APIError {
  error: string;
  detail?: string;
  status_code: number;
}

// ─── PLTB Prediction Types ──────────────────────────────────────────────────

export interface PredictRequest {
  location: string;
  recent_ws10m: number[];
  target_time: string;
}

export interface PredictResponse {
  location: string;
  target_time: string;
  predicted_ws10m: number;
  unit: string;
  scenario: string;
  model_confidence_r2: number;
  model_test_mae: number;
}

export interface RankingMetrics {
  meanWindSpeed: number;
  windPowerDensity: number;
  operationalHoursPct: number;
  windStabilityCV: number;
  modelR2: number;
}

export interface RankingCoordinates {
  lat: number;
  lng: number;
}

export interface RankingSite {
  id: string;
  name: string;
  rank: number;
  coordinates: RankingCoordinates;
  feasibilityScore: number;
  status: string;
  category: string;
  bestScenario: string;
  metrics: RankingMetrics;
}

export interface LocationMetrics {
  mae: number | null;
  rmse: number | null;
  mape: number | null;
  r2: number | null;
}

export interface LocationInfo {
  id: string;
  name: string;
  scenario: string;
  status: string;
  metrics: LocationMetrics;
  feature_count: number;
}

// ─── Configuration ──────────────────────────────────────────────────────────

export const API_BASE_URL = "https://nestrag.duckdns.org/ml";
export const API_VERSION = "v1";
// Route through Next.js API proxy to bypass CORS restrictions
// The proxy at /api/ml/[...path] forwards to the ML backend
export const API_PREFIX = "/api/ml";

// ─── Fetch Wrapper ──────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_PREFIX}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Unknown error",
      detail: response.statusText,
      status_code: response.status,
    }));

    throw new Error(
      errorData.detail || errorData.error || `API Error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

// ─── Chat API Methods ───────────────────────────────────────────────────────

/**
 * Send a chat message to Mahi AI and get a response.
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Check the health status of the AI backend.
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

/**
 * Check if the AI backend is reachable.
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await checkHealth();
    return true;
  } catch {
    return false;
  }
}

// ─── PLTB Prediction API Methods ────────────────────────────────────────────

/**
 * Predict wind speed 1 hour ahead for a given location.
 */
export async function predictWindSpeed(
  request: PredictRequest
): Promise<PredictResponse> {
  return apiFetch<PredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get site feasibility ranking from backend.
 */
export async function getRanking(): Promise<RankingSite[]> {
  return apiFetch<RankingSite[]>("/ranking");
}

/**
 * Get available prediction locations from model registry.
 */
export async function getLocations(): Promise<LocationInfo[]> {
  return apiFetch<LocationInfo[]>("/predict/locations");
}

