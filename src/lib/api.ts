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

// ─── Dashboard Integration Types & Functions ────────────────────────────────

/**
 * Static metadata for each PLTB site.
 * These fields are NOT available from the ML API.
 */
export const SITE_METADATA: Record<string, {
  shortName: string;
  province: string;
  area: string;
  elevation: string;
  climate: string;
  dataSource: string;
}> = {
  pandeglang: {
    shortName: "Pandeglang",
    province: "Banten",
    area: "1.825 Ha",
    elevation: "42 mdpl",
    climate: "Tropis Kering",
    dataSource: "NASA",
  },
  situbondo: {
    shortName: "Situbondo",
    province: "Jawa Timur",
    area: "2.150 Ha",
    elevation: "15 mdpl",
    climate: "Tropis Pesisir",
    dataSource: "NASA",
  },
  sukabumi: {
    shortName: "Sukabumi",
    province: "Jawa Barat",
    area: "1.520 Ha",
    elevation: "580 mdpl",
    climate: "Tropis Pegunungan",
    dataSource: "NASA",
  },
  bawean: {
    shortName: "Pulau Bawean",
    province: "Jawa Timur",
    area: "980 Ha",
    elevation: "8 mdpl",
    climate: "Tropis Kepulauan",
    dataSource: "NASA",
  },
  baron: {
    shortName: "Baron",
    province: "DI Yogyakarta",
    area: "1.250 Ha",
    elevation: "25 mdpl",
    climate: "Tropis Kering",
    dataSource: "NASA",
  },
};

export interface DashboardSite {
  id: string;
  name: string;
  shortName: string;
  province: string;
  coordinates: string;
  lat: number;
  lng: number;
  area: string;
  elevation: string;
  climate: string;
  dataSource: string;
  feasibilityScore: number;        // 0-100 scale
  status: string;                  // sangat_layak | layak | kurang_layak | tidak_layak
  category: string;
  bestScenario: string;
  rank: number;
  metrics: RankingMetrics;
  modelMetrics: LocationMetrics | null;
}

export interface DashboardData {
  sites: DashboardSite[];
  backendOnline: boolean;
}

/**
 * Fetch dashboard data by merging /ranking + /predict/locations + static metadata.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [rankingData, locationData] = await Promise.all([
    getRanking(),
    getLocations(),
  ]);

  const locationMap = new Map(locationData.map((l) => [l.id, l]));

  const sites: DashboardSite[] = rankingData.map((r) => {
    const locInfo = locationMap.get(r.id);
    const meta = SITE_METADATA[r.id];
    const score = Math.round(r.feasibilityScore * 1000) / 10; // 0.875 → 87.5

    return {
      id: r.id,
      name: meta ? `${meta.shortName} Wind Farm — ${meta.province}` : r.name,
      shortName: meta?.shortName ?? r.name,
      province: meta?.province ?? "",
      coordinates: `${r.coordinates.lat.toFixed(4)}° S, ${Math.abs(r.coordinates.lng).toFixed(4)}° E`,
      lat: r.coordinates.lat,
      lng: r.coordinates.lng,
      area: meta?.area ?? "-",
      elevation: meta?.elevation ?? "-",
      climate: meta?.climate ?? "-",
      dataSource: meta?.dataSource ?? "NASA",
      feasibilityScore: score,
      status: r.status,
      category: r.category,
      bestScenario: r.bestScenario,
      rank: r.rank,
      metrics: r.metrics,
      modelMetrics: locInfo?.metrics ?? null,
    };
  });

  return { sites, backendOnline: true };
}

