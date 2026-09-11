"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// ── Types ────────────────────────────────────────────────────────────────────
type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Styles ───────────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<
  ToastVariant,
  { background: string; border: string; color: string; icon: string }
> = {
  success: {
    background: "rgba(22, 101, 52, 0.95)",
    border: "1px solid rgba(134, 239, 172, 0.3)",
    color: "#dcfce7",
    icon: "✓",
  },
  error: {
    background: "rgba(127, 29, 29, 0.95)",
    border: "1px solid rgba(252, 165, 165, 0.3)",
    color: "#fee2e2",
    icon: "✕",
  },
  info: {
    background: "rgba(30, 58, 138, 0.95)",
    border: "1px solid rgba(147, 197, 253, 0.3)",
    color: "#dbeafe",
    icon: "ℹ",
  },
};

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <ToastList toasts={toasts} onDismiss={dismiss} />,
          document.body
        )}
    </ToastContext.Provider>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>.");
  }
  return ctx.toast;
}

// ── ToastList renderer ───────────────────────────────────────────────────────
function ToastList({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Single toast item with slide-in animation ────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const styles = VARIANT_STYLES[toast.variant];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Slide in
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translateX(120%)";
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.transition = "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease";
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    });
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onDismiss(toast.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        background: styles.background,
        border: styles.border,
        color: styles.color,
        fontSize: 14,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        maxWidth: 360,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        cursor: "pointer",
        pointerEvents: "all",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 1,
          opacity: 0.9,
        }}
      >
        {styles.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
    </div>
  );
}
