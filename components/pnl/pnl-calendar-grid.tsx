"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCentCurrency } from "@/lib/utils";

interface PnlCalendarGridProps {
  entries: {
    date: string;
    pnl: number;
    tradeCount: number;
  }[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PnlCalendarGrid({ entries }: PnlCalendarGridProps) {
  const initialMonth = entries.length > 0 ? parseISO(entries[entries.length - 1].date) : new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));

  const entriesByDate = useMemo(
    () =>
      new Map(
        entries.map((entry) => [
          entry.date,
          { pnl: entry.pnl, tradeCount: entry.tradeCount },
        ])
      ),
    [entries]
  );

  const visibleDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [currentMonth]);

  const monthlyEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const date = parseISO(entry.date);
        return (
          date.getFullYear() === currentMonth.getFullYear() &&
          date.getMonth() === currentMonth.getMonth()
        );
      }),
    [currentMonth, entries]
  );

  const positiveDays = monthlyEntries.filter((entry) => entry.pnl > 0).length;
  const negativeDays = monthlyEntries.filter((entry) => entry.pnl < 0).length;
  const monthlyPnl = monthlyEntries.reduce((sum, entry) => sum + entry.pnl, 0);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-sm">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/12">
                <CalendarDays className="h-4 w-4 text-indigo-400" />
              </div>
              <CardTitle className="text-base font-semibold">PnL Calendar</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Ringkasan profit dan loss harian berdasarkan trade yang tersimpan di journal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-40 text-center text-sm font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.16em]">
                Green Days
              </span>
            </div>
            <p className="text-2xl font-semibold">{positiveDays}</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
            <div className="mb-2 flex items-center gap-2 text-red-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.16em]">
                Red Days
              </span>
            </div>
            <p className="text-2xl font-semibold">{negativeDays}</p>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-4">
            <div className="mb-2 flex items-center gap-2 text-indigo-400">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.16em]">
                Monthly PnL
              </span>
            </div>
            <p
              className={cn(
                "text-2xl font-semibold",
                monthlyPnl >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {monthlyPnl > 0 ? "+" : ""}
              {formatCentCurrency(monthlyPnl, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/80">
          <div className="grid grid-cols-7 border-b border-border/70 bg-muted/25">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {visibleDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const entry = entriesByDate.get(key);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const pnlValue = entry?.pnl ?? 0;

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-28 border-b border-r border-border/60 p-2 transition-colors last:border-r-0",
                    !isCurrentMonth && "bg-muted/10 text-muted-foreground/55",
                    pnlValue > 0 && "bg-emerald-500/10",
                    pnlValue < 0 && "bg-red-500/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-indigo-500/14 text-indigo-400",
                        !isToday(day) && isCurrentMonth && "text-foreground",
                        !isCurrentMonth && "text-muted-foreground/55"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {entry ? (
                    <div className="mt-5 space-y-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          entry.pnl >= 0 ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {entry.pnl > 0 ? "+" : ""}
                        {formatCentCurrency(entry.pnl, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.tradeCount} {entry.tradeCount > 1 ? "trades" : "trade"}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
