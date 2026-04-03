export const APP_NAME = "TradeJournal";
export const APP_DESCRIPTION = "EA/Bot Trading Journal - Track, Analyze, Optimize";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { title: "Journal", href: "/journal", icon: "BookOpen" },
  { title: "PnL Calendar", href: "/pnl-calendar", icon: "CalendarDays" },
] as const;

export const COLORS = {
  win: "#10b981",
  lose: "#ef4444",
  profit: "#10b981",
  loss: "#ef4444",
  primary: "#6366f1",
  accent: "#8b5cf6",
  warning: "#f59e0b",
  info: "#3b82f6",
} as const;
