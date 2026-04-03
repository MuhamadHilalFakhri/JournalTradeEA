"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Landmark,
  Percent,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCentCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    initialBalance: number;
    totalTrades: number;
    totalWin: number;
    totalLose: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    totalWithdrawal: number;
    netProfit: number;
    currentBalance: number;
    peakBalance: number;
    maxDrawdown: number;
    averageWin: number;
    averageLoss: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Initial Balance",
      value: formatCentCurrency(stats.initialBalance),
      icon: Landmark,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
    {
      title: "Total Trades",
      value: stats.totalTrades.toString(),
      icon: BarChart3,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Total Win",
      value: stats.totalWin.toString(),
      icon: Trophy,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Total Lose",
      value: stats.totalLose.toString(),
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Target,
      color: stats.winRate >= 50 ? "text-emerald-400" : "text-red-400",
      bgColor: stats.winRate >= 50 ? "bg-emerald-500/10" : "bg-red-500/10",
      borderColor:
        stats.winRate >= 50 ? "border-emerald-500/20" : "border-red-500/20",
    },
    {
      title: "Total Profit",
      value: formatCentCurrency(stats.totalProfit),
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      trend: "up" as const,
    },
    {
      title: "Total Loss",
      value: formatCentCurrency(stats.totalLoss),
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      trend: "down" as const,
    },
    {
      title: "Withdrawal",
      value: formatCentCurrency(stats.totalWithdrawal),
      icon: ArrowDownToLine,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Net Profit",
      value: formatCentCurrency(stats.netProfit),
      icon: DollarSign,
      color: stats.netProfit >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: stats.netProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      borderColor:
        stats.netProfit >= 0 ? "border-emerald-500/20" : "border-red-500/20",
      trend: stats.netProfit >= 0 ? ("up" as const) : ("down" as const),
    },
    {
      title: "Current Balance",
      value: formatCentCurrency(stats.currentBalance),
      icon: Wallet,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Peak Balance",
      value: formatCentCurrency(stats.peakBalance),
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Max Drawdown",
      value: `${stats.maxDrawdown}%`,
      icon: Percent,
      color: stats.maxDrawdown > 20 ? "text-red-400" : "text-amber-400",
      bgColor: stats.maxDrawdown > 20 ? "bg-red-500/10" : "bg-amber-500/10",
      borderColor:
        stats.maxDrawdown > 20 ? "border-red-500/20" : "border-amber-500/20",
    },
    {
      title: "Avg Win",
      value: formatCentCurrency(stats.averageWin),
      icon: ArrowUpRight,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Avg Loss",
      value: formatCentCurrency(stats.averageLoss),
      icon: ArrowDownRight,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className={cn(
              "group border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80",
              card.borderColor
            )}
          >
            <CardContent className="p-3 md:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:text-xs">
                  {card.title}
                </span>
                <div className={cn("rounded-md p-1.5", card.bgColor)}>
                  <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", card.color)} />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "text-lg font-bold tracking-tight md:text-xl",
                    card.color
                  )}
                >
                  {card.value}
                </span>
                {card.trend ? (
                  <span
                    className={cn(
                      "text-xs",
                      card.trend === "up" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {card.trend === "up" ? "+" : "-"}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
