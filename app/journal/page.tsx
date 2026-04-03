"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { TradeForm } from "@/components/journal/trade-form";
import { TradeTable, TradeRow } from "@/components/journal/trade-table";
import { TradeFilters } from "@/components/journal/trade-filters";
import { EmptyState } from "@/components/journal/empty-state";
import { getAccountSettings, getTrades } from "@/actions/trade-actions";
import { formatCentCurrency } from "@/lib/utils";

export default function JournalPage() {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [accountReady, setAccountReady] = useState(false);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eaFilter, setEaFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const fetchTrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const [result, account] = await Promise.all([
        getTrades({
          search: search || undefined,
          eaName: eaFilter !== "all" ? eaFilter : undefined,
          result: resultFilter !== "all" ? resultFilter : undefined,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
          page,
          pageSize: 10,
        }),
        getAccountSettings(),
      ]);

      setTrades(result.trades);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setAccountReady(account.canAddTrades);
      setInitialBalance(account.initialBalance);
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, eaFilter, resultFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDebounce);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const handleClearFilters = () => {
    setSearchDebounce("");
    setSearch("");
    setEaFilter("all");
    setResultFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Trading Journal"
        description="Record and manage your EA/bot trades"
      />

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {total > 0 ? `${total} total trades` : "No trades recorded"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accountReady && initialBalance !== null
                ? `Initial balance set at ${formatCentCurrency(initialBalance)}`
                : "Set initial balance on dashboard before adding new trades"}
            </p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            disabled={!accountReady}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Trade</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {!accountReady ? (
          <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/6 px-4 py-5 text-sm">
            <p className="font-medium text-foreground">
              Journal dikunci sampai balance awal diisi.
            </p>
            <p className="mt-1 text-muted-foreground">
              Masuk ke dashboard untuk mengatur initial balance dan total withdrawal,
              setelah itu tombol add trade akan aktif.
            </p>
            <Link href="/" className="inline-flex">
              <Button variant="outline" size="sm" className="mt-4">
                Open Dashboard
              </Button>
            </Link>
          </div>
        ) : null}

        {/* Filters */}
        <TradeFilters
          search={searchDebounce}
          onSearchChange={setSearchDebounce}
          eaFilter={eaFilter}
          onEaFilterChange={handleFilterChange(setEaFilter)}
          resultFilter={resultFilter}
          onResultFilterChange={handleFilterChange(setResultFilter)}
          dateFrom={dateFrom}
          onDateFromChange={(d) => {
            setDateFrom(d);
            setPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(d) => {
            setDateTo(d);
            setPage(1);
          }}
          onClearFilters={handleClearFilters}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !accountReady && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">
              Balance awal belum diatur. Tambah trade dari journal akan tersedia
              setelah setup selesai di dashboard.
            </p>
          </div>
        ) : trades.length === 0 && !search && eaFilter === "all" && resultFilter === "all" && !dateFrom && !dateTo ? (
          <EmptyState onAddTrade={() => setFormOpen(true)} />
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-muted-foreground mb-2">
              No trades found matching your filters
            </p>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <TradeTable
            trades={trades}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onRefresh={fetchTrades}
          />
        )}
      </div>

      {/* Trade Form Dialog */}
      <TradeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchTrades}
      />
    </div>
  );
}
