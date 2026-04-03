"use client";

import { BarChart3, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { seedTrades } from "@/actions/trade-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardEmptyState() {
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedTrades();
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-8">
        <TrendingUp className="h-12 w-12 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Welcome to TradeJournal</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        Balance awal sudah siap. Lanjut isi hasil trade dari journal untuk
        menyalakan chart, statistik, dan kalender PnL.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/journal">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4 mr-2" />
            Add First Trade
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleSeed}
          disabled={isSeeding}
        >
          {isSeeding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          Load Sample Data
        </Button>
      </div>
    </div>
  );
}
