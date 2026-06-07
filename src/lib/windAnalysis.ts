/**
 * Wind Analysis — Statistical Computation Module
 * =================================================
 * Generates realistic wind analysis data (monthly profiles, Weibull distributions,
 * diurnal patterns, wind rose, etc.) parameterized by real metrics from the ML backend.
 *
 * All computations are deterministic given the same input parameters.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonthlyWindDataPoint {
  month: string;
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  energy: number;
}

export interface WeibullDistPoint {
  speed: string;
  frequency: number;
  weibull: number;
}

export interface FrequencyBin {
  bin: string;
  percent: number;
}

export interface DailyWindPoint {
  day: number;
  avgSpeed: number;
  monthlyAvg: number;
}

export interface DiurnalDataPoint {
  hour: number;
  speed40m: number;
  speed25m: number;
  speed10m: number;
  wpd40m: number;
  turbulence: number;
  temp3m: number;
}

export interface WindRosePoint {
  direction: string;
  angle: number;
  energy: number;
  frequency: number;
}

export interface HourlyPatternPoint {
  hour: string;
  speed: number;
  turbulence: number;
}

export interface KpiItem {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: string;
  trend: string;
  color: string;
  icon: string;
  description: string;
}

export interface SiteLocationData {
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
  lastUpdated: string;
  feasibilityScore: number;
  status: "layak" | "cukup" | "kurang";
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Seasonal multiplier — wind is stronger mid-year (Jun-Aug) in Indonesian monsoon pattern */
const SEASONAL_FACTORS = [0.85, 0.90, 0.95, 1.05, 1.12, 1.18, 1.22, 1.15, 1.02, 0.88, 0.80, 0.78];

const WIND_DIRECTIONS_16 = [
  { direction: "N",   angle: 0 },
  { direction: "NNE", angle: 22.5 },
  { direction: "NE",  angle: 45 },
  { direction: "ENE", angle: 67.5 },
  { direction: "E",   angle: 90 },
  { direction: "ESE", angle: 112.5 },
  { direction: "SE",  angle: 135 },
  { direction: "SSE", angle: 157.5 },
  { direction: "S",   angle: 180 },
  { direction: "SSW", angle: 202.5 },
  { direction: "SW",  angle: 225 },
  { direction: "WSW", angle: 247.5 },
  { direction: "W",   angle: 270 },
  { direction: "WNW", angle: 292.5 },
  { direction: "NW",  angle: 315 },
  { direction: "NNW", angle: 337.5 },
];

// Site metadata enrichment from ranking.json coordinates
const SITE_META: Record<string, Omit<SiteLocationData, "id" | "name" | "shortName" | "feasibilityScore" | "status">> = {
  pandeglang: {
    province: "Banten",
    coordinates: "-6.8600° S, 105.5400° E",
    lat: -6.86, lng: 105.54,
    area: "1.825 Ha", elevation: "42 mdpl",
    climate: "Tropis Kering", dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  },
  bawean: {
    province: "Jawa Timur",
    coordinates: "-5.7472° S, 112.6936° E",
    lat: -5.7472, lng: 112.6936,
    area: "980 Ha", elevation: "8 mdpl",
    climate: "Tropis Kepulauan", dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  },
  baron: {
    province: "DI Yogyakarta",
    coordinates: "-8.1324° S, 110.5437° E",
    lat: -8.1324, lng: 110.5437,
    area: "1.250 Ha", elevation: "25 mdpl",
    climate: "Tropis Kering", dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  },
  sukabumi: {
    province: "Jawa Barat",
    coordinates: "-7.2225° S, 106.5190° E",
    lat: -7.2225, lng: 106.519,
    area: "1.520 Ha", elevation: "580 mdpl",
    climate: "Tropis Pegunungan", dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  },
  situbondo: {
    province: "Jawa Timur",
    coordinates: "-7.8134° S, 114.4426° E",
    lat: -7.8134, lng: 114.4426,
    area: "2.150 Ha", elevation: "15 mdpl",
    climate: "Tropis Pesisir", dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  },
};

// ─── Deterministic hash for variation ───────────────────────────────────────

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Status mapping ─────────────────────────────────────────────────────────

function mapStatus(backendStatus: string): "layak" | "cukup" | "kurang" {
  if (backendStatus === "sangat_layak" || backendStatus === "layak") return "layak";
  if (backendStatus === "cukup_layak") return "cukup";
  return "kurang";
}

function statusLabel(backendStatus: string): string {
  switch (backendStatus) {
    case "sangat_layak": return "Sangat Layak";
    case "layak": return "Layak Dikembangkan";
    case "cukup_layak": return "Cukup Layak";
    case "kurang_layak": return "Kurang Layak";
    case "tidak_layak": return "Tidak Layak";
    default: return backendStatus;
  }
}

function statusTrend(backendStatus: string): string {
  if (backendStatus === "sangat_layak" || backendStatus === "layak") return "up";
  return "down";
}

// ─── Generator Functions ────────────────────────────────────────────────────

/**
 * Build site location data from ranking backend response
 */
export function buildSiteLocation(
  ranking: { id: string; name: string; feasibilityScore: number; status: string; coordinates: { lat: number; lng: number } }
): SiteLocationData {
  const meta = SITE_META[ranking.id] ?? {
    province: "Indonesia",
    coordinates: `${ranking.coordinates.lat.toFixed(4)}° S, ${ranking.coordinates.lng.toFixed(4)}° E`,
    lat: ranking.coordinates.lat,
    lng: ranking.coordinates.lng,
    area: "N/A",
    elevation: "N/A",
    climate: "Tropis",
    dataSource: "NASA POWER",
    lastUpdated: "2025-12-31",
  };

  return {
    id: ranking.id,
    name: `${ranking.name} Wind Farm — ${meta.province}`,
    shortName: ranking.name,
    feasibilityScore: ranking.feasibilityScore,
    status: mapStatus(ranking.status),
    ...meta,
  };
}

/**
 * Build KPI cards from ranking metrics
 */
export function buildKpis(
  meanWindSpeed: number,
  wpd: number,
  operationalPct: number,
  feasibilityScore: number,
  r2: number,
  backendStatus: string,
): KpiItem[] {
  // Estimate annual energy from WPD (simplified: area * hours * capacity factor)
  const estimatedEnergy = (wpd * 8760 * 0.001 * operationalPct / 100 * 0.35).toFixed(1);
  const capacityFactor = (operationalPct * 0.52).toFixed(1);

  return [
    {
      id: "avg-speed",
      label: "Rata-rata Kecepatan Angin",
      value: meanWindSpeed.toFixed(2),
      unit: "m/s",
      change: `Model R² = ${r2.toFixed(4)}`,
      trend: statusTrend(backendStatus),
      color: "blue",
      icon: "Wind",
      description: "Diukur pada ketinggian 10m (WS10M)",
    },
    {
      id: "annual-energy",
      label: "Potensi Energi Tahunan",
      value: estimatedEnergy,
      unit: "GWh",
      change: `WPD: ${wpd.toFixed(1)} W/m²`,
      trend: statusTrend(backendStatus),
      color: "cyan",
      icon: "Zap",
      description: "Estimasi produksi bersih",
    },
    {
      id: "capacity-factor",
      label: "Capacity Factor",
      value: capacityFactor,
      unit: "%",
      change: `Operasional: ${operationalPct.toFixed(1)}%`,
      trend: statusTrend(backendStatus),
      color: "green",
      icon: "TrendingUp",
      description: "Faktor kapasitas rata-rata",
    },
    {
      id: "feasibility",
      label: "Tingkat Kelayakan",
      value: feasibilityScore.toFixed(1),
      unit: "/100",
      change: statusLabel(backendStatus),
      trend: statusTrend(backendStatus),
      color: "amber",
      icon: "Star",
      description: "Skor kelayakan komprehensif",
    },
  ];
}

/**
 * Generate monthly wind profile from mean wind speed.
 * Uses seasonal monsoon pattern typical for Indonesia.
 */
export function generateMonthlyWind(meanSpeed: number, siteId: string): MonthlyWindDataPoint[] {
  return MONTHS.map((month, i) => {
    const factor = SEASONAL_FACTORS[i];
    const siteVariation = 1 + (seededRandom(hashSeed(siteId + month)) - 0.5) * 0.06;
    const avgSpeed = parseFloat((meanSpeed * factor * siteVariation).toFixed(2));
    const maxSpeed = parseFloat((avgSpeed * 1.65 + seededRandom(hashSeed(siteId + month + "max")) * 0.5).toFixed(2));
    const minSpeed = parseFloat((avgSpeed * 0.55 - seededRandom(hashSeed(siteId + month + "min")) * 0.3).toFixed(2));
    // Energy ∝ v³ (simplified)
    const energy = parseFloat((0.5 * 1.225 * Math.pow(avgSpeed, 3) * 720 * 0.001 * 0.4).toFixed(1));
    return { month, avgSpeed, maxSpeed, minSpeed: Math.max(0.1, minSpeed), energy };
  });
}

/**
 * Generate Weibull distribution from mean wind speed and stability CV.
 */
export function generateWeibullDistribution(meanSpeed: number, cv: number): WeibullDistPoint[] {
  // Weibull shape parameter k estimated from CV: k ≈ (1/CV)^1.086
  const k = Math.pow(1 / Math.max(cv, 0.1), 1.086);
  // Weibull scale parameter c from mean: c = mean / Γ(1 + 1/k)
  // Γ(1+1/k) ≈ approximated
  const gamma = Math.exp(-0.5772 / k) * Math.pow(k, -0.5 / k);
  const c = meanSpeed / gamma;

  return Array.from({ length: 16 }, (_, i) => {
    const v = i * 1.5;
    const weibullPdf = v === 0 ? 0 : (k / c) * Math.pow(v / c, k - 1) * Math.exp(-Math.pow(v / c, k));
    const weibullPct = parseFloat((weibullPdf * 100).toFixed(1));
    const freqPct = parseFloat(Math.max(0, weibullPct + (Math.sin(v * 0.5) * 0.3)).toFixed(1));
    return {
      speed: v.toFixed(1),
      frequency: freqPct,
      weibull: weibullPct,
    };
  });
}

/**
 * Generate fine-grained frequency bins (0.5 m/s) using Weibull distribution.
 */
export function generateFrequencyBins(meanSpeed: number, cv: number): FrequencyBin[] {
  const k = Math.pow(1 / Math.max(cv, 0.1), 1.086);
  const gamma = Math.exp(-0.5772 / k) * Math.pow(k, -0.5 / k);
  const c = meanSpeed / gamma;

  return Array.from({ length: 30 }, (_, i) => {
    const v = i * 0.5;
    const weibullPdf = v === 0 ? 0 : (k / c) * Math.pow(v / c, k - 1) * Math.exp(-Math.pow(v / c, k));
    return {
      bin: v.toFixed(1),
      percent: parseFloat(Math.max(0.001, weibullPdf * 0.5).toFixed(3)),
    };
  });
}

/**
 * Generate daily wind speed variation for a 31-day month.
 */
export function generateDailyWind(meanSpeed: number, siteId: string): DailyWindPoint[] {
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const seed = hashSeed(siteId + day.toString());
    const variation = Math.sin(day * 0.45) * (meanSpeed * 0.35) + Math.cos(day * 0.22) * (meanSpeed * 0.25);
    const noise = (seededRandom(seed) - 0.5) * meanSpeed * 0.15;
    const avgSpeed = parseFloat(Math.max(0.2, meanSpeed + variation + noise).toFixed(1));
    return { day, avgSpeed, monthlyAvg: meanSpeed };
  });
}

/**
 * Generate diurnal (24h) wind speed analysis at multiple heights.
 */
export function generateDiurnalData(meanSpeed: number, siteId: string): DiurnalDataPoint[] {
  const peakHour = siteId === "situbondo" ? 17 : siteId === "sukabumi" ? 12 : 14;

  return Array.from({ length: 24 }, (_, h) => {
    const phase = ((h - peakHour) / 24) * 2 * Math.PI;
    const seed = hashSeed(siteId + h.toString());
    const noise = (seededRandom(seed) - 0.5) * 0.3;

    const speed40m = parseFloat(Math.max(0.5, meanSpeed * 1.15 + Math.cos(phase) * (meanSpeed * 0.15) + noise).toFixed(1));
    const speed25m = parseFloat((speed40m * 0.91).toFixed(1));
    const speed10m = parseFloat((speed40m * 0.82).toFixed(1));
    const wpd40m = Math.round(0.5 * 1.225 * Math.pow(speed40m, 3));
    const ti = parseFloat((0.10 + Math.sin(phase + 1) * 0.05 + (seededRandom(seed + 1) - 0.5) * 0.02).toFixed(2));
    const temp3m = parseFloat((27.5 + Math.sin(((h - 6) / 24) * 2 * Math.PI) * 3).toFixed(1));

    return { hour: h, speed40m, speed25m, speed10m, wpd40m, turbulence: ti, temp3m };
  });
}

/**
 * Generate hourly wind pattern for the day.
 */
export function generateHourlyPattern(meanSpeed: number, siteId: string): HourlyPatternPoint[] {
  const peakHour = siteId === "situbondo" ? 17 : siteId === "sukabumi" ? 12 : 14;

  return Array.from({ length: 24 }, (_, h) => {
    const diurnal = Math.sin((h - peakHour) * Math.PI / 12) * (meanSpeed * 0.4);
    const speed = parseFloat(Math.max(0.5, meanSpeed + diurnal + (h % 3 === 0 ? 0.2 : -0.1)).toFixed(1));
    const turbulence = parseFloat((0.05 + ((h % 5) * 0.015) + (siteId === "pandeglang" ? 0.01 : 0)).toFixed(3));
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      speed,
      turbulence,
    };
  });
}

/**
 * Generate wind rose data — 16-direction distribution.
 * Dominant direction influenced by site-specific factors.
 */
export function generateWindRose(meanSpeed: number, siteId: string): WindRosePoint[] {
  // Dominant direction angle (SE for most Indonesian sites)
  const dominantAngle = siteId === "situbondo" ? 90 : siteId === "bawean" ? 120 : 135;

  return WIND_DIRECTIONS_16.map((dir) => {
    const angleDiff = Math.abs(dir.angle - dominantAngle);
    const normalizedDiff = Math.min(angleDiff, 360 - angleDiff) / 180;
    const directionFactor = Math.exp(-normalizedDiff * 3);
    const seed = hashSeed(siteId + dir.direction);
    const noise = (seededRandom(seed) - 0.5) * 2;

    const baseEnergy = meanSpeed * 2.2 * directionFactor;
    const energy = parseFloat(Math.max(1, baseEnergy + noise).toFixed(1));
    const frequency = parseFloat(Math.max(1, energy * 0.85 + (seededRandom(seed + 1) - 0.5)).toFixed(1));

    return { ...dir, energy, frequency };
  });
}

/**
 * Generate yearly trend data (2013-2025) for long-term stability chart.
 */
export function generateYearlyTrend(
  meanSpeed: number,
  feasibilityScore: number,
  siteId: string,
  monthlyData: MonthlyWindDataPoint[],
): { year: number; avgSpeed: number; energy: number; feasibilityScore: number }[] {
  return Array.from({ length: 13 }, (_, i) => {
    const year = 2013 + i;
    const seed = hashSeed(siteId + year.toString());
    const yearFactor = 1 + (seededRandom(seed) - 0.5) * 0.08;

    const avgSpeed = parseFloat((meanSpeed * yearFactor).toFixed(2));
    const totalEnergy = parseFloat(
      (monthlyData.reduce((sum, d) => sum + d.energy, 0) * yearFactor).toFixed(1)
    );
    const score = parseFloat(
      Math.min(100, Math.max(0, feasibilityScore + (yearFactor - 1) * 50)).toFixed(1)
    );

    return { year, avgSpeed, energy: totalEnergy, feasibilityScore: score };
  });
}
