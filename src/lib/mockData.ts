// Mock data for Nestra application — 4 PLTB Locations

export interface SiteLocation {
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

export const allLocations: SiteLocation[] = [
  {
    id: "pandeglang",
    name: "Pandeglang Wind Farm — Banten",
    shortName: "Pandeglang",
    province: "Banten",
    coordinates: "-6.8600° S, 105.5400° E",
    lat: -6.86,
    lng: 105.54,
    area: "1.825 Ha",
    elevation: "42 mdpl",
    climate: "Tropis Kering",
    dataSource: "NASA",
    lastUpdated: "04 Apr 2026",
    feasibilityScore: 74.0,
    status: "layak",
  },
  {
    id: "situbondo",
    name: "Situbondo Wind Farm — Jawa Timur",
    shortName: "Situbondo",
    province: "Jawa Timur",
    coordinates: "-7.8134° S, 114.4426° E",
    lat: -7.8134,
    lng: 114.4426,
    area: "2.150 Ha",
    elevation: "15 mdpl",
    climate: "Tropis Pesisir",
    dataSource: "NASA",
    lastUpdated: "04 Apr 2026",
    feasibilityScore: 23.6,
    status: "kurang",
  },
  {
    id: "sukabumi",
    name: "Sukabumi Wind Farm — Jawa Barat",
    shortName: "Sukabumi",
    province: "Jawa Barat",
    coordinates: "-7.2225° S, 106.5190° E",
    lat: -7.2225,
    lng: 106.519,
    area: "1.520 Ha",
    elevation: "580 mdpl",
    climate: "Tropis Pegunungan",
    dataSource: "NASA",
    lastUpdated: "04 Apr 2026",
    feasibilityScore: 49.0,
    status: "cukup",
  },
  {
    id: "bawean",
    name: "Pulau Bawean Wind Farm — Jawa Timur",
    shortName: "Pulau Bawean",
    province: "Jawa Timur",
    coordinates: "-5.7472° S, 112.6936° E",
    lat: -5.7472,
    lng: 112.6936,
    area: "980 Ha",
    elevation: "8 mdpl",
    climate: "Tropis Kepulauan",
    dataSource: "NASA",
    lastUpdated: "04 Apr 2026",
    feasibilityScore: 65.9,
    status: "layak",
  },
  {
    id: "baron",
    name: "Baron Wind Farm — DI Yogyakarta",
    shortName: "Baron",
    province: "DI Yogyakarta",
    coordinates: "-8.1324° S, 110.5437° E",
    lat: -8.1324,
    lng: 110.5437,
    area: "1.250 Ha",
    elevation: "25 mdpl",
    climate: "Tropis Kering",
    dataSource: "NASA",
    lastUpdated: "04 Apr 2026",
    feasibilityScore: 45.0,
    status: "kurang",
  },
];

// Per-site KPI data
export const siteKpiData: Record<string, typeof kpiData> = {
  pandeglang: [
    { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "4.98", unit: "m/s", change: "+0.3 vs historical", trend: "up", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
    { id: "annual-energy", label: "Potensi Energi Tahunan", value: "312.7", unit: "GWh", change: "+18 GWh vs proyeksi", trend: "up", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
    { id: "capacity-factor", label: "Capacity Factor", value: "42.3", unit: "%", change: "+2.1% vs baseline", trend: "up", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
    { id: "feasibility", label: "Tingkat Kelayakan", value: "74.0", unit: "/100", change: "Sangat Layak", trend: "up", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
  ],
  situbondo: [
    { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "2.40", unit: "m/s", change: "-0.2 vs historical", trend: "down", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
    { id: "annual-energy", label: "Potensi Energi Tahunan", value: "33.8", unit: "GWh", change: "-5 GWh vs proyeksi", trend: "down", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
    { id: "capacity-factor", label: "Capacity Factor", value: "4.6", unit: "%", change: "-1.5% vs baseline", trend: "down", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
    { id: "feasibility", label: "Tingkat Kelayakan", value: "23.6", unit: "/100", change: "Tidak Layak", trend: "down", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
  ],
  sukabumi: [
    { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "3.76", unit: "m/s", change: "+0.1 vs historical", trend: "up", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
    { id: "annual-energy", label: "Potensi Energi Tahunan", value: "132.3", unit: "GWh", change: "+4 GWh vs proyeksi", trend: "up", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
    { id: "capacity-factor", label: "Capacity Factor", value: "17.9", unit: "%", change: "+0.5% vs baseline", trend: "up", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
    { id: "feasibility", label: "Tingkat Kelayakan", value: "49.0", unit: "/100", change: "Cukup Layak", trend: "up", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
  ],
  bawean: [
    { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "4.60", unit: "m/s", change: "+0.4 vs historical", trend: "up", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
    { id: "annual-energy", label: "Potensi Energi Tahunan", value: "265.9", unit: "GWh", change: "+14 GWh vs proyeksi", trend: "up", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
    { id: "capacity-factor", label: "Capacity Factor", value: "36.0", unit: "%", change: "+1.8% vs baseline", trend: "up", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
    { id: "feasibility", label: "Tingkat Kelayakan", value: "65.9", unit: "/100", change: "Layak Dikembangkan", trend: "up", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
  ],
  baron: [
    { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "3.52", unit: "m/s", change: "-0.1 vs historical", trend: "down", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
    { id: "annual-energy", label: "Potensi Energi Tahunan", value: "107.1", unit: "GWh", change: "-3 GWh vs proyeksi", trend: "down", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
    { id: "capacity-factor", label: "Capacity Factor", value: "14.5", unit: "%", change: "-1.0% vs baseline", trend: "down", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
    { id: "feasibility", label: "Tingkat Kelayakan", value: "45.0", unit: "/100", change: "Kurang Layak", trend: "down", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
  ],
};

// Per-site monthly wind data
export const siteMonthlyWindData: Record<string, typeof monthlyWindData> = {
  pandeglang: [
    { month: "Jan", avgSpeed: 4.3, maxSpeed: 7.3, minSpeed: 2.4, energy: 14.5 },
    { month: "Feb", avgSpeed: 4.7, maxSpeed: 7.7, minSpeed: 2.7, energy: 15.5 },
    { month: "Mar", avgSpeed: 4.8, maxSpeed: 8.1, minSpeed: 2.8, energy: 16.4 },
    { month: "Apr", avgSpeed: 5.5, maxSpeed: 9.0, minSpeed: 3.1, energy: 18.3 },
    { month: "Mei", avgSpeed: 5.8, maxSpeed: 9.5, minSpeed: 3.4, energy: 19.7 },
    { month: "Jun", avgSpeed: 6.2, maxSpeed: 10.2, minSpeed: 3.7, energy: 21.2 },
    { month: "Jul", avgSpeed: 6.4, maxSpeed: 10.6, minSpeed: 3.8, energy: 21.9 },
    { month: "Agu", avgSpeed: 6.1, maxSpeed: 9.9, minSpeed: 3.6, energy: 20.7 },
    { month: "Sep", avgSpeed: 5.3, maxSpeed: 8.7, minSpeed: 3.2, energy: 17.9 },
    { month: "Okt", avgSpeed: 4.5, maxSpeed: 7.6, minSpeed: 2.7, energy: 15.2 },
    { month: "Nov", avgSpeed: 4.1, maxSpeed: 6.8, minSpeed: 2.4, energy: 13.2 },
    { month: "Des", avgSpeed: 3.9, maxSpeed: 6.5, minSpeed: 2.2, energy: 12.9 },
  ],
  situbondo: [
    { month: "Jan", avgSpeed: 2.1, maxSpeed: 3.5, minSpeed: 1.2, energy: 2.7 },
    { month: "Feb", avgSpeed: 2.2, maxSpeed: 3.7, minSpeed: 1.3, energy: 2.9 },
    { month: "Mar", avgSpeed: 2.3, maxSpeed: 3.9, minSpeed: 1.4, energy: 3.1 },
    { month: "Apr", avgSpeed: 2.6, maxSpeed: 4.4, minSpeed: 1.5, energy: 3.5 },
    { month: "Mei", avgSpeed: 2.7, maxSpeed: 4.6, minSpeed: 1.7, energy: 3.8 },
    { month: "Jun", avgSpeed: 2.9, maxSpeed: 4.9, minSpeed: 1.8, energy: 4.0 },
    { month: "Jul", avgSpeed: 3.0, maxSpeed: 5.1, minSpeed: 1.9, energy: 4.2 },
    { month: "Agu", avgSpeed: 2.8, maxSpeed: 4.8, minSpeed: 1.8, energy: 3.9 },
    { month: "Sep", avgSpeed: 2.5, maxSpeed: 4.3, minSpeed: 1.5, energy: 3.4 },
    { month: "Okt", avgSpeed: 2.1, maxSpeed: 3.7, minSpeed: 1.3, energy: 2.9 },
    { month: "Nov", avgSpeed: 1.8, maxSpeed: 3.3, minSpeed: 1.1, energy: 2.5 },
    { month: "Des", avgSpeed: 1.8, maxSpeed: 3.2, minSpeed: 1.1, energy: 2.4 },
  ],
  sukabumi: [
    { month: "Jan", avgSpeed: 3.1, maxSpeed: 5.3, minSpeed: 1.7, energy: 8.3 },
    { month: "Feb", avgSpeed: 3.3, maxSpeed: 5.7, minSpeed: 1.9, energy: 9.1 },
    { month: "Mar", avgSpeed: 3.6, maxSpeed: 5.9, minSpeed: 2.1, energy: 9.8 },
    { month: "Apr", avgSpeed: 4.1, maxSpeed: 6.8, minSpeed: 2.3, energy: 11.3 },
    { month: "Mei", avgSpeed: 4.3, maxSpeed: 7.1, minSpeed: 2.5, energy: 12.5 },
    { month: "Jun", avgSpeed: 4.5, maxSpeed: 7.6, minSpeed: 2.7, energy: 13.4 },
    { month: "Jul", avgSpeed: 4.7, maxSpeed: 7.8, minSpeed: 2.8, energy: 14.0 },
    { month: "Agu", avgSpeed: 4.4, maxSpeed: 7.3, minSpeed: 2.6, energy: 12.7 },
    { month: "Sep", avgSpeed: 3.9, maxSpeed: 6.5, minSpeed: 2.3, energy: 10.9 },
    { month: "Okt", avgSpeed: 3.5, maxSpeed: 5.8, minSpeed: 2.0, energy: 9.3 },
    { month: "Nov", avgSpeed: 3.0, maxSpeed: 5.1, minSpeed: 1.7, energy: 7.8 },
    { month: "Des", avgSpeed: 2.8, maxSpeed: 4.9, minSpeed: 1.6, energy: 7.5 },
  ],
  bawean: [
    { month: "Jan", avgSpeed: 4.1, maxSpeed: 7.0, minSpeed: 2.4, energy: 14.5 },
    { month: "Feb", avgSpeed: 4.3, maxSpeed: 7.3, minSpeed: 2.6, energy: 15.6 },
    { month: "Mar", avgSpeed: 4.5, maxSpeed: 7.6, minSpeed: 2.7, energy: 16.4 },
    { month: "Apr", avgSpeed: 5.0, maxSpeed: 8.4, minSpeed: 3.0, energy: 18.3 },
    { month: "Mei", avgSpeed: 5.3, maxSpeed: 8.8, minSpeed: 3.2, energy: 19.6 },
    { month: "Jun", avgSpeed: 5.5, maxSpeed: 9.2, minSpeed: 3.4, energy: 20.4 },
    { month: "Jul", avgSpeed: 5.7, maxSpeed: 9.5, minSpeed: 3.5, energy: 21.2 },
    { month: "Agu", avgSpeed: 5.4, maxSpeed: 9.1, minSpeed: 3.3, energy: 20.1 },
    { month: "Sep", avgSpeed: 4.8, maxSpeed: 8.1, minSpeed: 2.9, energy: 17.5 },
    { month: "Okt", avgSpeed: 4.2, maxSpeed: 7.2, minSpeed: 2.5, energy: 14.9 },
    { month: "Nov", avgSpeed: 3.8, maxSpeed: 6.4, minSpeed: 2.3, energy: 13.1 },
    { month: "Des", avgSpeed: 3.6, maxSpeed: 6.1, minSpeed: 2.1, energy: 12.1 },
  ],
  baron: [
    { month: "Jan", avgSpeed: 3.1, maxSpeed: 5.8, minSpeed: 1.5, energy: 6.8 },
    { month: "Feb", avgSpeed: 3.3, maxSpeed: 6.1, minSpeed: 1.6, energy: 7.2 },
    { month: "Mar", avgSpeed: 3.4, maxSpeed: 6.3, minSpeed: 1.8, energy: 7.5 },
    { month: "Apr", avgSpeed: 3.6, maxSpeed: 6.8, minSpeed: 2.0, energy: 8.1 },
    { month: "Mei", avgSpeed: 3.8, maxSpeed: 7.2, minSpeed: 2.2, energy: 8.8 },
    { month: "Jun", avgSpeed: 4.1, maxSpeed: 7.8, minSpeed: 2.5, energy: 9.6 },
    { month: "Jul", avgSpeed: 4.3, maxSpeed: 8.2, minSpeed: 2.7, energy: 10.1 },
    { month: "Agu", avgSpeed: 4.0, maxSpeed: 7.5, minSpeed: 2.4, energy: 9.2 },
    { month: "Sep", avgSpeed: 3.5, maxSpeed: 6.6, minSpeed: 1.9, energy: 7.9 },
    { month: "Okt", avgSpeed: 3.2, maxSpeed: 6.0, minSpeed: 1.6, energy: 7.0 },
    { month: "Nov", avgSpeed: 2.9, maxSpeed: 5.4, minSpeed: 1.4, energy: 6.2 },
    { month: "Des", avgSpeed: 2.8, maxSpeed: 5.1, minSpeed: 1.3, energy: 5.9 },
  ],
};

// Keep legacy exports for backward compatibility
export const locationData = allLocations[0];

export const kpiData = [
  { id: "avg-speed", label: "Rata-rata Kecepatan Angin", value: "4.98", unit: "m/s", change: "+0.3 vs historical", trend: "up", color: "blue", icon: "Wind", description: "Diukur pada ketinggian 10m (WS10M)" },
  { id: "annual-energy", label: "Potensi Energi Tahunan", value: "312.7", unit: "GWh", change: "+18 GWh vs proyeksi", trend: "up", color: "cyan", icon: "Zap", description: "Estimasi produksi bersih (100m hub)" },
  { id: "capacity-factor", label: "Capacity Factor", value: "42.3", unit: "%", change: "+2.1% vs baseline", trend: "up", color: "green", icon: "TrendingUp", description: "Faktor kapasitas rata-rata" },
  { id: "feasibility", label: "Tingkat Kelayakan", value: "74.0", unit: "/100", change: "Sangat Layak", trend: "up", color: "amber", icon: "Star", description: "Skor kelayakan komprehensif" },
];

export const monthlyWindData = [
  { month: "Jan", avgSpeed: 4.3, maxSpeed: 7.3, minSpeed: 2.4, energy: 14.5 },
  { month: "Feb", avgSpeed: 4.7, maxSpeed: 7.7, minSpeed: 2.7, energy: 15.5 },
  { month: "Mar", avgSpeed: 4.8, maxSpeed: 8.1, minSpeed: 2.8, energy: 16.4 },
  { month: "Apr", avgSpeed: 5.5, maxSpeed: 9.0, minSpeed: 3.1, energy: 18.3 },
  { month: "Mei", avgSpeed: 5.8, maxSpeed: 9.5, minSpeed: 3.4, energy: 19.7 },
  { month: "Jun", avgSpeed: 6.2, maxSpeed: 10.2, minSpeed: 3.7, energy: 21.2 },
  { month: "Jul", avgSpeed: 6.4, maxSpeed: 10.6, minSpeed: 3.8, energy: 21.9 },
  { month: "Agu", avgSpeed: 6.1, maxSpeed: 9.9, minSpeed: 3.6, energy: 20.7 },
  { month: "Sep", avgSpeed: 5.3, maxSpeed: 8.7, minSpeed: 3.2, energy: 17.9 },
  { month: "Okt", avgSpeed: 4.5, maxSpeed: 7.6, minSpeed: 2.7, energy: 15.2 },
  { month: "Nov", avgSpeed: 4.1, maxSpeed: 6.8, minSpeed: 2.4, energy: 13.2 },
  { month: "Des", avgSpeed: 3.9, maxSpeed: 6.5, minSpeed: 2.2, energy: 12.9 },
];

export const heatmapData = [
  { zone: "Zona A (Barat Laut)", lat: -3.92, lng: 119.82, potential: 95, avgSpeed: 10.4 },
  { zone: "Zona B (Utara)", lat: -3.90, lng: 119.85, potential: 88, avgSpeed: 9.8 },
  { zone: "Zona C (Timur Laut)", lat: -3.93, lng: 119.88, potential: 82, avgSpeed: 9.2 },
  { zone: "Zona D (Tengah)", lat: -3.96, lng: 119.85, potential: 87, avgSpeed: 9.6 },
  { zone: "Zona E (Tenggara)", lat: -3.99, lng: 119.87, potential: 74, avgSpeed: 8.7 },
  { zone: "Zona F (Selatan)", lat: -4.01, lng: 119.84, potential: 68, avgSpeed: 8.1 },
];

export const windDirectionData = [
  { direction: "N", value: 8.5, frequency: 12 },
  { direction: "NE", value: 9.2, frequency: 18 },
  { direction: "E", value: 10.4, frequency: 22 },
  { direction: "SE", value: 11.1, frequency: 25 },
  { direction: "S", value: 9.8, frequency: 15 },
  { direction: "SW", value: 7.2, frequency: 8 },
  { direction: "W", value: 6.5, frequency: 5 },
  { direction: "NW", value: 7.8, frequency: 10 },
  { direction: "NNE", value: 8.9, frequency: 14 },
  { direction: "ENE", value: 10.1, frequency: 19 },
  { direction: "ESE", value: 10.8, frequency: 23 },
  { direction: "SSE", value: 10.5, frequency: 20 },
];

export const windSpeedDistribution = [
  { speed: "0-2", frequency: 3.2, weibull: 2.8 },
  { speed: "2-4", frequency: 8.5, weibull: 7.9 },
  { speed: "4-6", frequency: 15.3, weibull: 14.8 },
  { speed: "6-8", frequency: 24.7, weibull: 23.9 },
  { speed: "8-10", frequency: 22.1, weibull: 22.8 },
  { speed: "10-12", frequency: 15.8, weibull: 16.2 },
  { speed: "12-14", frequency: 7.2, weibull: 7.8 },
  { speed: "14-16", frequency: 2.5, weibull: 3.1 },
  { speed: "16+", frequency: 0.7, weibull: 0.7 },
];

// ── Wind Rose Data (16 directions, energy + frequency) ──
export const windRoseData = [
  { direction: "N",   angle: 0,    energy: 5.2,  frequency: 4.8  },
  { direction: "NNE", angle: 22.5, energy: 6.1,  frequency: 5.5  },
  { direction: "NE",  angle: 45,   energy: 7.8,  frequency: 7.2  },
  { direction: "ENE", angle: 67.5, energy: 9.4,  frequency: 8.8  },
  { direction: "E",   angle: 90,   energy: 11.2, frequency: 10.5 },
  { direction: "ESE", angle: 112.5,energy: 13.5, frequency: 11.8 },
  { direction: "SE",  angle: 135,  energy: 14.8, frequency: 12.5 },
  { direction: "SSE", angle: 157.5,energy: 13.2, frequency: 11.0 },
  { direction: "S",   angle: 180,  energy: 9.6,  frequency: 8.2  },
  { direction: "SSW", angle: 202.5,energy: 7.4,  frequency: 6.5  },
  { direction: "SW",  angle: 225,  energy: 5.8,  frequency: 5.0  },
  { direction: "WSW", angle: 247.5,energy: 8.6,  frequency: 7.8  },
  { direction: "W",   angle: 270,  energy: 10.4, frequency: 9.5  },
  { direction: "WNW", angle: 292.5,energy: 12.1, frequency: 10.2 },
  { direction: "NW",  angle: 315,  energy: 9.8,  frequency: 8.0  },
  { direction: "NNW", angle: 337.5,energy: 6.5,  frequency: 5.8  },
];

// ── Wind Speed Frequency (fine 0.5 m/s bins, like histogram in the report) ──
export const windSpeedFrequencyBins = [
  { bin: "0.5", percent: 0.4 },
  { bin: "1.0", percent: 1.1 },
  { bin: "1.5", percent: 1.8 },
  { bin: "2.0", percent: 2.5 },
  { bin: "2.5", percent: 3.4 },
  { bin: "3.0", percent: 4.2 },
  { bin: "3.5", percent: 5.1 },
  { bin: "4.0", percent: 5.8 },
  { bin: "4.5", percent: 6.5 },
  { bin: "5.0", percent: 7.2 },
  { bin: "5.5", percent: 7.8 },
  { bin: "6.0", percent: 8.3 },
  { bin: "6.5", percent: 8.9 },
  { bin: "7.0", percent: 9.2 },
  { bin: "7.5", percent: 8.7 },
  { bin: "8.0", percent: 7.9 },
  { bin: "8.5", percent: 7.0 },
  { bin: "9.0", percent: 5.8 },
  { bin: "9.5", percent: 4.5 },
  { bin: "10.0", percent: 3.4 },
  { bin: "10.5", percent: 2.5 },
  { bin: "11.0", percent: 1.7 },
  { bin: "11.5", percent: 1.1 },
  { bin: "12.0", percent: 0.7 },
  { bin: "12.5", percent: 0.4 },
  { bin: "13.0", percent: 0.2 },
  { bin: ">13", percent: 0.1 },
];

// ── Daily Average Wind Speed (31 days, monthly average line) ──
export const dailyWindSpeed = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  // Simulate realistic daily variation around monthly avg of ~7.0 m/s
  const base = 7.0;
  const variation = Math.sin(day * 0.45) * 2.5 + Math.cos(day * 0.22) * 1.8;
  const noise = (Math.sin(day * 3.7) + Math.cos(day * 2.1)) * 0.6;
  return {
    day,
    avgSpeed: Math.round((base + variation + noise) * 10) / 10,
    monthlyAvg: 7.0,
  };
});

// ── Diurnal Wind Speed Analysis (hourly, multi-height + WPD) ──
export interface DiurnalDataPoint {
  hour: number;
  speed40m: number;
  speed25m: number;
  speed10m: number;
  wpd40m: number;        // Wind Power Density at 40m (W/m²)
  turbulence: number;
  temp3m: number;         // Temperature at 3m (°C)
}

export const diurnalAnalysisData: DiurnalDataPoint[] = Array.from({ length: 24 }, (_, h) => {
  // Diurnal pattern: lowest around 4-6 AM, peak around 12-14 PM
  const phase = ((h - 14) / 24) * 2 * Math.PI;
  const base40 = 7.0 + Math.cos(phase) * 1.0;
  const noise = Math.sin(h * 1.3) * 0.15;
  const speed40 = Math.round((base40 + noise) * 10) / 10;
  const speed25 = Math.round((speed40 * 0.91) * 10) / 10;
  const speed10 = Math.round((speed40 * 0.82) * 10) / 10;
  // WPD ≈ 0.5 * ρ * v³, ρ ≈ 1.225 kg/m³
  const wpd = Math.round(0.5 * 1.225 * Math.pow(speed40, 3));
  const ti = Math.round((0.10 + Math.sin(phase + 1) * 0.05 + Math.random() * 0.02) * 100) / 100;
  const temp = Math.round((27.5 + Math.sin(((h - 6) / 24) * 2 * Math.PI) * 3) * 10) / 10;

  return {
    hour: h,
    speed40m: speed40,
    speed25m: speed25,
    speed10m: speed10,
    wpd40m: wpd,
    turbulence: ti,
    temp3m: temp,
  };
});

// ── Diurnal Summary Table (like the table in the report image) ──
export interface DiurnalSummaryRow {
  hour: number;
  speed40m: number;
  speed25m: number;
  speed10m: number;
  windShear: number;
  wpd: number;
  turbulence: number;
  temp3m: number;
}

export const diurnalSummaryTable: DiurnalSummaryRow[] = diurnalAnalysisData.map((d) => ({
  hour: d.hour,
  speed40m: d.speed40m,
  speed25m: d.speed25m,
  speed10m: d.speed10m,
  windShear: Math.round((Math.log(d.speed40m / d.speed10m) / Math.log(40 / 10)) * 100) / 100,
  wpd: d.wpd40m,
  turbulence: d.turbulence,
  temp3m: d.temp3m,
}));

export const turbineScenarios = [
  { id: 1, scenario: "Skenario A", hubHeight: 80, turbineType: "Vestas V117-3.45", capacity: "3.45 MW", turbineCount: 30, totalCapacity: 103.5, annualEnergy: 265.4, capacityFactor: 39.2, capex: 1245, lcoe: 0.058, payback: 8.2, feasibility: 78 },
  { id: 2, scenario: "Skenario B", hubHeight: 100, turbineType: "Siemens SG 5.0-145", capacity: "5.0 MW", turbineCount: 25, totalCapacity: 125.0, annualEnergy: 312.7, capacityFactor: 42.3, capex: 1512, lcoe: 0.052, payback: 7.4, feasibility: 87 },
  { id: 3, scenario: "Skenario C", hubHeight: 120, turbineType: "GE Haliade-X 6 MW", capacity: "6.0 MW", turbineCount: 20, totalCapacity: 120.0, annualEnergy: 338.9, capacityFactor: 45.8, capex: 1680, lcoe: 0.049, payback: 6.9, feasibility: 92 },
];

export const annualPowerOutput = [
  { year: 2026, output: 285.4, projected: 290.0 },
  { year: 2027, output: 298.2, projected: 305.0 },
  { year: 2028, output: 306.8, projected: 312.0 },
  { year: 2029, output: 311.5, projected: 315.0 },
  { year: 2030, output: 312.7, projected: 318.0 },
  { year: 2031, output: 308.9, projected: 316.0 },
  { year: 2032, output: 304.2, projected: 313.0 },
  { year: 2033, output: 299.8, projected: 309.0 },
  { year: 2034, output: 295.0, projected: 305.0 },
  { year: 2035, output: 290.1, projected: 300.0 },
];

// ── ML Model Performance Metrics ──
export interface MLModelMetrics {
  id: string;
  name: string;
  shortName: string;
  category: "traditional" | "deep_learning";
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  color: string;
  bgColor: string;
}

export const mlModels: MLModelMetrics[] = [
  { id: "rf", name: "Random Forest", shortName: "RF", category: "traditional", mae: 0.108, rmse: 0.155, mape: 4.47, r2: 0.988, color: "#10b981", bgColor: "#ecfdf5" },
  { id: "lr", name: "Linear Regression", shortName: "LR", category: "traditional", mae: 0.114, rmse: 0.161, mape: 4.51, r2: 0.985, color: "#3b82f6", bgColor: "#eff6ff" },
  { id: "svr", name: "SVR", shortName: "SVR", category: "traditional", mae: 0.143, rmse: 0.221, mape: 5.96, r2: 0.978, color: "#8b5cf6", bgColor: "#f5f3ff" },
  { id: "cnn", name: "CNN", shortName: "CNN", category: "deep_learning", mae: 0.108, rmse: 0.151, mape: 4.44, r2: 0.989, color: "#f59e0b", bgColor: "#fffbeb" },
  { id: "transformer", name: "Transformer", shortName: "TF", category: "deep_learning", mae: 0.118, rmse: 0.163, mape: 4.67, r2: 0.987, color: "#ef4444", bgColor: "#fef2f2" },
];

// ── Feature Engineering Scenarios S0–S7 ──
export interface FeatureScenario {
  id: string;
  label: string;
  description: string;
  features: string[];
  rfR2: number;
  rfMae: number;
}

export const featureScenarios: FeatureScenario[] = [
  { id: "S0", label: "S0 — Baseline", description: "Baseline tanpa fitur tambahan", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M"], rfR2: 0.952, rfMae: 0.198 },
  { id: "S1", label: "S1 — + Lag 1h", description: "+ lag1", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1"], rfR2: 0.971, rfMae: 0.154 },
  { id: "S2", label: "S2 — + Lag 6h", description: "+ lag1 + lag6", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6"], rfR2: 0.978, rfMae: 0.138 },
  { id: "S3", label: "S3 — + Lag 24h", description: "+ lag1 + lag6 + lag24", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6", "lag24"], rfR2: 0.982, rfMae: 0.126 },
  { id: "S4", label: "S4 — + Roll Mean 3h", description: "+ rolling_mean_3h", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6", "lag24", "rolling_mean_3h"], rfR2: 0.985, rfMae: 0.118 },
  { id: "S5", label: "S5 — + Roll Mean 24h", description: "+ rolling_mean_24h", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6", "lag24", "rolling_mean_3h", "rolling_mean_24h"], rfR2: 0.986, rfMae: 0.114 },
  { id: "S6", label: "S6 — + Roll Std 3h", description: "+ rolling_std_3h", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6", "lag24", "rolling_mean_3h", "rolling_mean_24h", "rolling_std_3h"], rfR2: 0.987, rfMae: 0.111 },
  { id: "S7", label: "S7 — + Cyclical Enc.", description: "+ cyclical encoding (hour_sin, hour_cos)", features: ["WS10M", "T2M", "RH2M", "PS", "WD10M", "lag1", "lag6", "lag24", "rolling_mean_3h", "rolling_mean_24h", "rolling_std_3h", "hour_sin", "hour_cos"], rfR2: 0.988, rfMae: 0.108 },
];

// ── Model Hyperparameters ──
export const modelHyperparameters: Record<string, { label: string; value: string }[]> = {
  rf: [
    { label: "n_estimators", value: "120 / 180" },
    { label: "max_depth", value: "20 / None" },
    { label: "min_samples_split", value: "5 / 2" },
    { label: "min_samples_leaf", value: "2 / 1" },
    { label: "max_features", value: "sqrt" },
    { label: "bootstrap", value: "True" },
    { label: "random_state", value: "42" },
    { label: "n_jobs", value: "1" },
    { label: "RF_TRAIN_CAP", value: "80,000" },
  ],
  lr: [
    { label: "fit_intercept", value: "True" },
    { label: "normalize", value: "False" },
    { label: "n_jobs", value: "-1" },
  ],
  svr: [
    { label: "kernel", value: "rbf" },
    { label: "C", value: "1.0" },
    { label: "epsilon", value: "0.1" },
    { label: "gamma", value: "scale" },
  ],
  cnn: [
    { label: "conv_layers", value: "3" },
    { label: "filters", value: "64 / 128 / 256" },
    { label: "kernel_size", value: "3" },
    { label: "activation", value: "ReLU" },
    { label: "dropout_rate", value: "0.2" },
    { label: "batch_size", value: "32" },
    { label: "learning_rate", value: "0.001" },
    { label: "optimizer", value: "Adam" },
    { label: "epochs", value: "100" },
    { label: "sequence_length", value: "24" },
  ],
  transformer: [
    { label: "d_model", value: "128" },
    { label: "n_heads", value: "8" },
    { label: "n_layers", value: "4" },
    { label: "d_ff", value: "256" },
    { label: "dropout", value: "0.1" },
    { label: "batch_size", value: "32" },
    { label: "learning_rate", value: "0.0001" },
    { label: "optimizer", value: "Adam" },
    { label: "epochs", value: "150" },
    { label: "sequence_length", value: "24" },
  ],
};

// ── Prediction vs Actual timeline data (dummy, 48h) ──
export const predictionTimeline = Array.from({ length: 48 }, (_, i) => {
  const hour = i % 24;
  const base = 6.5 + Math.sin((hour - 14) / 24 * 2 * Math.PI) * 2.0;
  const actual = Math.round((base + (Math.random() - 0.5) * 1.2) * 100) / 100;
  const predicted = Math.round((actual + (Math.random() - 0.5) * 0.3) * 100) / 100;
  return {
    hour: `${String(hour).padStart(2, "0")}:00`,
    day: i < 24 ? "Hari 1" : "Hari 2",
    actual,
    predicted,
    residual: Math.round((actual - predicted) * 100) / 100,
  };
});

// ── Scenario comparison for model R² across S0–S7 ──
export const scenarioModelComparison = featureScenarios.map((s) => ({
  scenario: s.id,
  RF: s.rfR2,
  LR: +(s.rfR2 - 0.003 - Math.random() * 0.002).toFixed(3),
  SVR: +(s.rfR2 - 0.010 - Math.random() * 0.003).toFixed(3),
  CNN: +(s.rfR2 + 0.001).toFixed(3),
  Transformer: +(s.rfR2 - 0.001).toFixed(3),
}));

// ── Feature Importance (Random Forest) ──
export const featureImportance = [
  { feature: "lag1", importance: 0.342 },
  { feature: "rolling_mean_3h", importance: 0.218 },
  { feature: "WS10M", importance: 0.145 },
  { feature: "lag6", importance: 0.098 },
  { feature: "rolling_mean_24h", importance: 0.067 },
  { feature: "lag24", importance: 0.042 },
  { feature: "rolling_std_3h", importance: 0.035 },
  { feature: "hour_sin", importance: 0.021 },
  { feature: "hour_cos", importance: 0.018 },
  { feature: "T2M", importance: 0.008 },
  { feature: "RH2M", importance: 0.004 },
  { feature: "PS", importance: 0.002 },
];

export const assessmentCriteria = [
  { category: "Kecepatan Angin", score: 88, weight: 30, status: "Excellent" },
  { category: "Aksesibilitas Lokasi", score: 82, weight: 20, status: "Good" },
  { category: "Infrastruktur Grid", score: 75, weight: 25, status: "Good" },
  { category: "Dampak Lingkungan", score: 91, weight: 15, status: "Excellent" },
  { category: "Regulasi & Perizinan", score: 78, weight: 10, status: "Good" },
];

export const nlpResponses: Record<string, string> = {
  kelayakan: `Berdasarkan analisis komprehensif dataset cuaca angin di **Pandeglang, Banten**, lokasi ini menunjukkan potensi yang **sangat layak** untuk pembangunan PLTB dengan skor kelayakan 74.0/100.

**Faktor Utama Kelayakan:**
- Rata-rata kecepatan angin 4.98 m/s (diukur pada ketinggian 10m (WS10M), setara 8.4 m/s pada hub height 100m), melampaui ambang minimum kelayakan
- Capacity Factor mencapai 42.3%, sangat kompetitif untuk wilayah Asia Tenggara
- Pola angin konsisten sepanjang tahun dengan puncak pada periode April–Agustus
- Infrastruktur jaringan transmisi PLN tersedia dalam radius 12 km

**Rekomendasi:** Lanjutkan ke tahap studi kelayakan detail (FS) berdasarkan validasi model ML dari 13 tahun data historis (2013–2025).`,

  energi: `Berdasarkan model prediksi ML dengan algoritma **Gradient Boosting** yang dilatih pada 13 tahun data historis NASA (2013–2025):

**Estimasi Produksi Energi Tahunan (Skenario Optimal — Skenario C):**
- Kapasitas terpasang: **120 MW** (20 unit × 6 MW GE Haliade-X)
- Produksi bruto: **338.9 GWh/tahun**
- Produksi neto (setelah losses 8%): **311.8 GWh/tahun**
- Capacity Factor: **45.8%**
- Ekuivalen rumah tangga terlayani: **±155.900 rumah** (asumsi 2 MWh/rumah/tahun)
- Reduksi emisi CO₂: **±247.000 ton CO₂eq/tahun**

**Proyeksi 10 Tahun:** Produksi stabil di rentang 285–340 GWh dengan degradasi turbin 0.5%/tahun.`,

  kelebihan: `**Kelebihan Lokasi Pandeglang:**

✅ **Kecepatan angin tinggi & konsisten** — Rata-rata 4.98 m/s (WS10M, setara 8.4 m/s di hub 100m), jauh di atas rata-rata nasional
✅ **Pola angin musiman yang baik** — Dominasi angin tenggara April-Agustus dengan kecepatan 10-12 m/s
✅ **Lahan tersedia luas** — Area 1.825 Ha dengan kontur yang sesuai untuk penempatan turbin
✅ **Preseden yang baik** — Pandeglang sudah memiliki PLTB 75 MW yang beroperasi sejak 2018
✅ **Dukungan pemerintah daerah** — Termasuk dalam RTRW Kabupaten untuk zona energi terbarukan
✅ **Dekat jaringan transmisi** — Gardu induk 150 kV PLN dalam radius 12 km

⚠️ **Kekurangan & Risiko:**

❌ **Musim tenang November–Januari** — Kecepatan angin turun, produksi berkurang ~35%
❌ **Akses jalan terbatas** — Beberapa zona memerlukan perbaikan jalan untuk mobilisasi turbin
❌ **Potensi konflik lahan** — Sebagian area merupakan lahan pertanian yang perlu kompensasi
❌ **Risiko korosif udara laut** — Jarak 45 km dari pantai memerlukan spesifikasi anti-korosi`,
};
