"use client";

import { S } from "@/constants/styles";

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
}

export function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <button style={S.toggle(on)} onClick={onToggle} role="switch" aria-checked={on}>
      <div style={S.toggleKnob(on)} />
    </button>
  );
}