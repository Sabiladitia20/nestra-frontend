"use client";

import { useEffect, useRef } from "react";
import type { SiteLocation } from "@/lib/mockData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SiteMapProps {
  locations: SiteLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  layak: "#10b981",
  cukup: "#f59e0b",
  kurang: "#ef4444",
};

export default function SiteMap({ locations, selectedId, onSelect }: SiteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-6.5, 110],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Attribution (small)
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('© <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when locations or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId;
      const color = STATUS_COLORS[loc.status] || "#3b82f6";

      // Pulse ring for selected
      if (isSelected) {
        const pulse = L.circleMarker([loc.lat, loc.lng], {
          radius: 18,
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 1.5,
          opacity: 0.5,
          className: "map-pulse",
        }).addTo(map);
        markersRef.current.push(pulse);
      }

      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: isSelected ? 10 : 7,
        color: "#fff",
        weight: isSelected ? 2.5 : 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:11px;">
          <strong>${loc.shortName}</strong><br/>
          <span style="color:${color};font-weight:700">${loc.feasibilityScore}/100</span> · ${loc.province}<br/>
          <span style="opacity:0.7;font-size:10px">${loc.coordinates}</span>
        </div>`,
        {
          direction: "top",
          offset: [0, -10],
          className: "custom-tooltip",
        }
      );

      marker.on("click", () => onSelect(loc.id));
      markersRef.current.push(marker);
    });

    // Fit bounds
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [locations, selectedId, onSelect]);

  return (
    <div className="relative w-full h-full min-h-[280px] rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend overlay */}
      <div className="absolute top-2.5 left-2.5 z-[1000] bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
        <p className="text-[9px] text-white/60 font-semibold uppercase tracking-wider mb-1">Status</p>
        <div className="flex flex-col gap-1">
          {[
            { color: "#10b981", label: "Layak" },
            { color: "#f59e0b", label: "Cukup" },
            { color: "#ef4444", label: "Kurang" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-white/80">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
