"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { BarChart3 } from "lucide-react";
import { formatCentCurrency } from "@/lib/utils";

interface ProfitLossChartProps {
  data: { name: string; profit: number; loss: number }[];
}

export function ProfitLossChart({ data }: ProfitLossChartProps) {
  if (data.length === 0) return null;

  const formatCurrencyValue = (value: ValueType | undefined) => {
    if (Array.isArray(value)) {
      return Number(value[0] ?? 0);
    }
    return Number(value ?? 0);
  };

  return (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </div>
          <CardTitle className="text-sm font-semibold">Profit vs Loss by EA</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-4 pb-4">
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
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
                formatter={(value: ValueType | undefined, name: NameType | undefined) => [
                  formatCentCurrency(formatCurrencyValue(value)),
                  String(name ?? "").charAt(0).toUpperCase() + String(name ?? "").slice(1),
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: ValueType | undefined) => (
                  <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                    {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                  </span>
                )}
              />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
