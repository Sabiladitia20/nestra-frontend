"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { windRoseData as defaultWindRoseData } from "@/lib/mockData";

interface WindRoseDataPoint {
  direction: string;
  angle: number;
  energy: number;
  frequency: number;
}

interface WindRoseChartProps {
  width?: number;
  height?: number;
  selectedSiteId?: string;
  data?: WindRoseDataPoint[];
}

export default function WindRoseChart({ width = 420, height = 420, selectedSiteId = "pandeglang", data }: WindRoseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const windRoseDataSelected = useMemo(() => {
    // If external data is provided, use it directly
    if (data && data.length > 0) return data;

    // Fallback: shift/rotate index based on location ID
    let offset = 0;
    if (selectedSiteId === "situbondo") offset = 4;
    else if (selectedSiteId === "bawean") offset = -2;
    else if (selectedSiteId === "sukabumi") offset = 2;
    else if (selectedSiteId === "baron") offset = 6;

    return defaultWindRoseData.map((d, index) => {
      const targetIndex = (index + offset + 16) % 16;
      const refPoint = defaultWindRoseData[targetIndex];
      return {
        ...d,
        frequency: refPoint.frequency,
        energy: refPoint.energy,
      };
    });
  }, [selectedSiteId, data]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 50;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Find max value for scaling
    const maxEnergy = Math.max(...windRoseDataSelected.map((d) => d.energy));
    const maxFreq = Math.max(...windRoseDataSelected.map((d) => d.frequency));
    const maxVal = Math.max(maxEnergy, maxFreq);

    // Draw concentric reference circles
    const circleSteps = [0.25, 0.5, 0.75, 1.0];
    ctx.setLineDash([4, 4]);
    circleSteps.forEach((step) => {
      const r = maxRadius * step;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Label
      const pctLabel = `${(step * maxVal).toFixed(1)}%`;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pctLabel, cx, cy - r + 11);
    });
    ctx.setLineDash([]);

    // Draw axis lines
    for (let i = 0; i < 16; i++) {
      const angleDeg = i * 22.5 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angleRad) * maxRadius, cy + Math.sin(angleRad) * maxRadius);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw petals
    const petalWidth = 18; // degrees half-width
    windRoseDataSelected.forEach((point) => {
      const angleDeg = point.angle - 90; // -90 to make N = top
      const angleRad = (angleDeg * Math.PI) / 180;
      const halfPetal = (petalWidth * Math.PI) / 180;

      // Energy petal (darker, main)
      const energyRadius = (point.energy / maxVal) * maxRadius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, energyRadius, angleRad - halfPetal, angleRad + halfPetal);
      ctx.closePath();

      // Create gradient
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, energyRadius);
      grad.addColorStop(0, "rgba(30, 58, 138, 0.65)");
      grad.addColorStop(0.6, "rgba(30, 64, 175, 0.85)");
      grad.addColorStop(1, "rgba(29, 78, 216, 0.95)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(30, 64, 175, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Frequency petal (lighter overlay, slightly narrower)
      const freqRadius = (point.frequency / maxVal) * maxRadius;
      const freqHalf = halfPetal * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, freqRadius, angleRad - freqHalf, angleRad + freqHalf);
      ctx.closePath();
      ctx.fillStyle = "rgba(96, 165, 250, 0.45)";
      ctx.fill();
    });

    // Draw center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#1e3a8a";
    ctx.fill();

    // Direction labels
    const directions = [
      { label: "N", angle: 0 },
      { label: "NNE", angle: 22.5 },
      { label: "NE", angle: 45 },
      { label: "ENE", angle: 67.5 },
      { label: "E", angle: 90 },
      { label: "ESE", angle: 112.5 },
      { label: "SE", angle: 135 },
      { label: "SSE", angle: 157.5 },
      { label: "S", angle: 180 },
      { label: "SSW", angle: 202.5 },
      { label: "SW", angle: 225 },
      { label: "WSW", angle: 247.5 },
      { label: "W", angle: 270 },
      { label: "WNW", angle: 292.5 },
      { label: "NW", angle: 315 },
      { label: "NNW", angle: 337.5 },
    ];

    directions.forEach((d) => {
      const angleRad = ((d.angle - 90) * Math.PI) / 180;
      const labelR = maxRadius + 22;
      const x = cx + Math.cos(angleRad) * labelR;
      const y = cy + Math.sin(angleRad) * labelR;

      const isCardinal = ["N", "E", "S", "W"].includes(d.label);
      ctx.fillStyle = isCardinal ? "#1e293b" : "#64748b";
      ctx.font = isCardinal ? "bold 12px Inter, sans-serif" : "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.label, x, y);
    });
  }, [width, height, windRoseDataSelected]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ width, height }} />
      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(30, 64, 175, 0.85)" }} />
          <span>% Total Wind Energy (Wh/m²)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(96, 165, 250, 0.45)" }} />
          <span>% Total Time</span>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 text-center">
        <p>Circle Center = 0.0% · Inner Circle = 7.5% · Outer Circle = 15.0%</p>
      </div>
    </div>
  );
}
