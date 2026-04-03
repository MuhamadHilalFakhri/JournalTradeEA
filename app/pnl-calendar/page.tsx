import { getPnlCalendarData } from "@/actions/trade-actions";
import { Header } from "@/components/layout/header";
import { PnlCalendarGrid } from "@/components/pnl/pnl-calendar-grid";

export default async function PnlCalendarPage() {
  const entries = await getPnlCalendarData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="PnL Calendar"
        description="Monthly view of daily profit and loss from your trading journal"
      />

      <div className="flex-1 p-4 md:p-6">
        {entries.length > 0 ? (
          <PnlCalendarGrid entries={entries} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
            <h2 className="text-lg font-semibold">No PnL data yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tambahkan trade di journal dulu agar kalender PnL bisa menampilkan
              hasil harian.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
