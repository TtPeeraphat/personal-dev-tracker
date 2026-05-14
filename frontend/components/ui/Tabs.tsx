"use client";

import { S } from "@/constants/styles";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div style={S.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab}
          style={{ ...S.tab(active === tab), cursor: "pointer", fontFamily: "inherit" }}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}