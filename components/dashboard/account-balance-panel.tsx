"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ExternalLink,
  Landmark,
  Loader2,
  Save,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { updateAccountSettings } from "@/actions/trade-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCentCurrency } from "@/lib/utils";

interface AccountBalancePanelProps {
  account: {
    initialBalance: number | null;
    totalWithdrawal: number;
    hasInitialBalance: boolean;
    canAddTrades: boolean;
  };
  currentBalance: number;
  hasTrades: boolean;
}

export function AccountBalancePanel({
  account,
  currentBalance,
  hasTrades,
}: AccountBalancePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initialBalance, setInitialBalance] = useState(
    account.initialBalance?.toString() ?? ""
  );
  const [totalWithdrawal, setTotalWithdrawal] = useState(
    account.totalWithdrawal.toString()
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateAccountSettings({
        initialBalance: Number(initialBalance),
        totalWithdrawal: Number(totalWithdrawal || 0),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-sm">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Account Balance Setup
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dashboard sekarang jadi pusat untuk balance awal dan total withdrawal.
              Journal hanya dipakai untuk hasil trade.
            </p>
          </div>
          {account.canAddTrades ? (
            <Link href="/journal">
              <Button variant="outline" className="w-full sm:w-auto">
                Open Journal
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/14">
              <Landmark className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Initial Balance
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {account.initialBalance === null
                ? "Not set"
                : formatCentCurrency(account.initialBalance)}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/14">
              <ArrowDownToLine className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Total Withdrawal
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {formatCentCurrency(account.totalWithdrawal)}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/14">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Current Balance
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {formatCentCurrency(currentBalance)}
            </p>
          </div>

          {!account.canAddTrades ? (
            <div className="sm:col-span-3 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/6 p-4 text-sm text-muted-foreground">
              Isi initial balance dulu untuk membuka fitur add trade di journal dan
              mengaktifkan chart performa.
            </div>
          ) : !hasTrades ? (
            <div className="sm:col-span-3 rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Balance awal sudah siap. Langkah berikutnya tinggal isi hasil trade
              dari halaman journal.
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Manage Account Values</h3>
            <p className="text-xs text-muted-foreground">
              Ubah balance awal atau akumulasi withdrawal kapan saja dari dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-balance">Initial Balance</Label>
            <Input
              id="initial-balance"
              type="number"
              min="0"
              step="0.01"
              value={initialBalance}
              onChange={(event) => setInitialBalance(event.target.value)}
              placeholder="1000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-withdrawal">Total Withdrawal</Label>
            <Input
              id="total-withdrawal"
              type="number"
              min="0"
              step="0.01"
              value={totalWithdrawal}
              onChange={(event) => setTotalWithdrawal(event.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Current balance dihitung otomatis dari balance awal + net profit - withdrawal.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
