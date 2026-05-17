import type { Database } from "@/integrations/supabase/types";

export type TradingCall = Database["public"]["Tables"]["trading_calls"]["Row"];
export type Trader = Database["public"]["Tables"]["traders"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export function statusStyle(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-primary text-primary bg-primary/10 animate-pulse-dot";
    case "TARGET_HIT":
      return "border-primary bg-primary text-primary-foreground";
    case "STOPPED":
      return "border-bear text-bear bg-bear/10";
    case "PENDING":
      return "border-muted-foreground text-muted-foreground bg-muted/30";
    case "CLOSED":
      return "border-border text-muted-foreground bg-muted/20";
    default:
      return "border-border text-muted-foreground";
  }
}

export function fmtNum(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtSigned(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  return `${v >= 0 ? "+" : ""}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
