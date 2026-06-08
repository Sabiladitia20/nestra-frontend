"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
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
  const [hoverData, setHoverData] = useState<{ point: WindRoseDataPoint; x: number; y: number } | null>(null);

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 50;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius || dist < 5) {
      setHoverData(null);
      return;
    }

    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    let pointAngle = angleDeg + 90;
    if (pointAngle < 0) pointAngle += 360;
    if (pointAngle >= 360) pointAngle -= 360;

    const closestPoint = windRoseDataSelected.reduce((prev, curr) => {
      const diffPrev = Math.min(Math.abs(prev.angle - pointAngle), 360 - Math.abs(prev.angle - pointAngle));
      const diffCurr = Math.min(Math.abs(curr.angle - pointAngle), 360 - Math.abs(curr.angle - pointAngle));
      return diffCurr < diffPrev ? curr : prev;
    });

    const diff = Math.min(Math.abs(closestPoint.angle - pointAngle), 360 - Math.abs(closestPoint.angle - pointAngle));

    if (diff <= 18) {
       // Save local coordinate for absolute positioning within the container
       setHoverData({ point: closestPoint, x, y });
    } else {
       setHoverData(null);
    }
  }, [width, height, windRoseDataSelected]);

  const handleMouseLeave = () => setHoverData(null);

  return (
    <div className="flex flex-col items-center relative w-full">
      <div className="relative" style={{ width, height, maxWidth: '100%' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', cursor: hoverData ? "pointer" : "default" }} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Tooltip */}
        {hoverData && (
          <div 
            className="absolute z-50 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-lg p-3 pointer-events-none"
            style={{ 
              left: hoverData.x < width / 2 ? hoverData.x + 15 : undefined,
              right: hoverData.x >= width / 2 ? width - hoverData.x + 15 : undefined,
              top: hoverData.y < height / 2 ? hoverData.y + 15 : undefined,
              bottom: hoverData.y >= height / 2 ? height - hoverData.y + 15 : undefined,
              minWidth: '150px' 
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-xs font-bold text-slate-800">Arah {hoverData.point.direction}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{hoverData.point.angle}°</span>
            </div>
            <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(30, 64, 175, 0.85)" }} />
                <span>Total Energy</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{hoverData.point.energy.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(96, 165, 250, 0.45)" }} />
                <span>Total Time</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{hoverData.point.frequency.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
      </div>

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
        <p>Circle Center = 0.0% · Inner Circle = 25% · Outer Circle = 100% dari Max</p>
      </div>
    </div>
  );
}
