"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Target } from "lucide-react";

interface WinLoseChartProps {
  data: { name: string; value: number; fill: string }[];
}

const RADIAN = Math.PI / 180;

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomLabelProps) {
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function WinLoseChart({ data }: WinLoseChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10">
            <Target className="h-4 w-4 text-purple-400" />
          </div>
          <CardTitle className="text-sm font-semibold">Win vs Lose</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-4 pb-4">
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: ValueType | undefined, name: NameType | undefined) => [
                  `${value ?? 0} trades`,
                  String(name ?? ""),
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: ValueType | undefined) => (
                  <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                    {String(value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
