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

export function fmtNum(n: number | null | undefined, digits?: number) {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  if (digits !== undefined) {
    return v.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  // Auto-scale precision for small memecoin prices
  if (v !== 0 && Math.abs(v) < 0.01) {
    const sig = Math.max(2, -Math.floor(Math.log10(Math.abs(v))) + 2);
    return v.toLocaleString(undefined, { minimumFractionDigits: sig, maximumFractionDigits: sig });
  }
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtSigned(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  return `${v >= 0 ? "+" : ""}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
