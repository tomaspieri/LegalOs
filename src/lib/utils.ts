import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function getWhatsAppUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// ─── Design system helpers ──────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#1D4ED8",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#BE185D",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Pipeline stage dot colors keyed by stage id (see src/types PipelineStage)
export const STAGE_COLORS: Record<string, string> = {
  new_lead: "#64748B",
  case_evaluation: "#2563EB",
  retainer_sent: "#7C3AED",
  case_management: "#D97706",
  litigation: "#DC2626",
  in_litigation: "#DC2626",
  dropped: "#9AAAB8",
};

// Short stage labels used in compact contexts (e.g. sidebar recent cases)
export const STAGE_SHORT_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  case_evaluation: "Evaluation",
  retainer_sent: "Retainer",
  case_management: "Mgmt",
  litigation: "Litigation",
  in_litigation: "Litigation",
  dropped: "Dropped",
};

export function stageColor(stage: string): string {
  return STAGE_COLORS[stage] ?? "#9AAAB8";
}
