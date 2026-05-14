"use client";

import { DAYS } from "@/constants/styles";

interface MiniChartProps {
  vals: number[];
  highlightIdx: number;
  height?: number;
}

export function MiniChart({ vals, highlightIdx, height = 60 }: MiniChartProps) {
  const max = Math.max(...vals);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {vals.map((v, i) => (
        <div
          key={i}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
            <div
              style={{
                width: "100%",
                background: i === highlightIdx ? "#1D9E75" : "#E1F5EE",
                borderRadius: "3px 3px 0 0",
                height: `${Math.round((v / max) * 100)}%`,
                transition: "height 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: 9, color: "#888780", fontFamily: "monospace", marginTop: 3 }}>
            {DAYS[i]}
          </div>
        </div>
      ))}
    </div>
  );
}