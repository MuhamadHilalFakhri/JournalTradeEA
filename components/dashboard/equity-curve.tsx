"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { TrendingUp } from "lucide-react";
import { formatCentCurrency } from "@/lib/utils";

interface EquityCurveProps {
  data: { trade: string; balance: number; date: string }[];
}

export function EquityCurve({ data }: EquityCurveProps) {
  if (data.length === 0) return null;

  return (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <CardTitle className="text-sm font-semibold">Equity Curve</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-4 pb-4">
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="trade"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCentCurrency(Number(value))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: ValueType | undefined) => [
                  formatCentCurrency(Number(value ?? 0)),
                  "Balance",
                ]}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#balanceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
