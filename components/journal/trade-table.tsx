"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, MoreHorizontal, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "./delete-dialog";
import { TradeForm } from "./trade-form";
import { formatCentCurrency } from "@/lib/utils";

export interface TradeRow {
  id: number;
  tradeNumber: number;
  date: string;
  sessionStart: string | null;
  sessionEnd: string | null;
  eaName: string;
  pair: string;
  result: string;
  profit: number;
  loss: number;
  profitLossPercent: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TradeTableProps {
  trades: TradeRow[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const formatSession = (start: string | null, end: string | null) => {
  if (!start || !end) return "-";
  return `${start} - ${end}`;
};

export function TradeTable({
  trades,
  page,
  totalPages,
  total,
  onPageChange,
  onRefresh,
}: TradeTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editTrade, setEditTrade] = useState<TradeRow | null>(null);

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>EA</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead className="text-center">Result</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Loss</TableHead>
              <TableHead className="text-right">P/L %</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow
                key={trade.id}
                className="group hover:bg-muted/20 transition-colors"
              >
                <TableCell className="text-center text-muted-foreground font-mono text-xs">
                  {trade.tradeNumber}
                </TableCell>
                <TableCell className="text-sm">
                  {format(parseISO(trade.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {formatSession(trade.sessionStart, trade.sessionEnd)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {trade.eaName}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{trade.pair}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      "text-[10px] font-semibold border-0",
                      trade.result === "Win"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    )}
                  >
                    {trade.result}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-emerald-400">
                  {trade.profit > 0 ? formatCentCurrency(trade.profit) : "-"}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-red-400">
                  {trade.loss > 0 ? formatCentCurrency(trade.loss) : "-"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      trade.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {trade.profitLossPercent > 0 ? "+" : ""}
                    {trade.profitLossPercent}%
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTrade(trade)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(trade.id)}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  #{trade.tradeNumber}
                </span>
                <Badge
                  className={cn(
                    "text-[10px] font-semibold border-0",
                    trade.result === "Win"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  )}
                >
                  {trade.result}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {trade.eaName}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditTrade(trade)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteId(trade.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                <p className="font-medium">
                  {format(parseISO(trade.date), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pair</p>
                <p className="font-mono font-medium">{trade.pair}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Session</p>
                <p className="font-mono font-medium">
                  {formatSession(trade.sessionStart, trade.sessionEnd)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Profit</p>
                <p className="font-medium text-emerald-400">
                  {trade.profit > 0 ? formatCentCurrency(trade.profit) : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Loss</p>
                <p className="font-medium text-red-400">
                  {trade.loss > 0 ? formatCentCurrency(trade.loss) : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">P/L %</p>
                <p
                  className={cn(
                    "font-semibold",
                    trade.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {trade.profitLossPercent > 0 ? "+" : ""}
                  {trade.profitLossPercent}%
                </p>
              </div>
            </div>

            {trade.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {trade.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          Showing {trades.length} of {total} trades
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open: boolean) => !open && setDeleteId(null)}
        tradeId={deleteId}
        onSuccess={onRefresh}
      />

      {/* Edit Form */}
      <TradeForm
        open={editTrade !== null}
        onOpenChange={(open: boolean) => !open && setEditTrade(null)}
        editTrade={editTrade}
        onSuccess={onRefresh}
      />
    </>
  );
}
