"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCentCurrency } from "@/lib/utils";

interface EASummaryStat {
  name: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
}

interface EASummaryProps {
  data: EASummaryStat[];
}

export function EASummary({ data }: EASummaryProps) {
  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((ea) => (
        <Card
          key={ea.name}
          className="border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
        >
          <CardHeader className="pb-3 px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-500/10">
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
                <CardTitle className="text-sm font-semibold">{ea.name}</CardTitle>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold",
                  ea.winRate >= 50
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    : "border-red-500/30 text-red-400 bg-red-500/10"
                )}
              >
                {ea.winRate}% WR
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trades</p>
                <p className="text-lg font-bold">{ea.totalTrades}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">W / L</p>
                <p className="text-lg font-bold">
                  <span className="text-emerald-400">{ea.wins}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-red-400">{ea.losses}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" /> Profit
                </p>
                <p className="text-sm font-semibold text-emerald-400">
                  {formatCentCurrency(ea.totalProfit)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-400" /> Loss
                </p>
                <p className="text-sm font-semibold text-red-400">
                  {formatCentCurrency(ea.totalLoss)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Net Profit</span>
                <span
                  className={cn(
                    "text-base font-bold",
                    ea.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {formatCentCurrency(ea.netProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
