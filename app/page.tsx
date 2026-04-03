import { connection } from "next/server";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { WinLoseChart } from "@/components/dashboard/win-lose-chart";
import { ProfitLossChart } from "@/components/dashboard/profit-loss-chart";
import { EASummary } from "@/components/dashboard/ea-summary";
import {
  getAccountSettings,
  getChartData,
  getDashboardStats,
} from "@/actions/trade-actions";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { AccountBalancePanel } from "@/components/dashboard/account-balance-panel";

export default async function DashboardPage() {
  await connection();

  const [stats, chartData, account] = await Promise.all([
    getDashboardStats(),
    getChartData(),
    getAccountSettings(),
  ]);

  const hasData = stats.totalTrades > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard"
        description="Overview of your EA/bot trading performance"
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <AccountBalancePanel
          key={`${account.initialBalance ?? "unset"}-${account.totalWithdrawal}`}
          account={account}
          currentBalance={stats.currentBalance}
          hasTrades={hasData}
        />

        {stats.hasInitialBalance ? <StatsCards stats={stats} /> : null}

        {!stats.hasInitialBalance ? (
          <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/6 px-5 py-8 text-center">
            <h2 className="text-lg font-semibold">Set initial balance first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Setelah balance awal diisi dari dashboard, journal akan terbuka dan
              seluruh chart performa akan mulai menghitung otomatis.
            </p>
          </div>
        ) : !hasData ? (
          <DashboardEmptyState />
        ) : (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <EquityCurve data={chartData.equityCurve} />
              </div>
              <div>
                <WinLoseChart data={chartData.winLose} />
              </div>
            </div>

            {/* Profit/Loss + EA Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <ProfitLossChart data={chartData.profitLoss} />
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  EA Performance
                </h2>
                <EASummary data={chartData.eaSummary} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
