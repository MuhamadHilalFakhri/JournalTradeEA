"use client";

import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddTrade: () => void;
}

export function EmptyState({ onAddTrade }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-6">
        <BookOpen className="h-10 w-10 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No trades yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start tracking your EA/bot trading performance by adding your first
        trade. Profit, loss, statistics, and kalender PnL akan dihitung
        otomatis dari hasil trade kamu.
      </p>
      <Button
        onClick={onAddTrade}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Trade
      </Button>
    </div>
  );
}
