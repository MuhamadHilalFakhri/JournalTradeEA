"use server";

import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import {
  tradeFormSchema,
  type TradeFormValues,
} from "@/lib/validations/trade";
import {
  accountSettingsSchema,
  type AccountSettingsValues,
} from "@/lib/validations/account";

const ACCOUNT_PROFILE_ID = 1;

const APP_PATHS = ["/", "/journal", "/pnl-calendar"] as const;

type AccountSnapshot = {
  initialBalance: number | null;
  totalWithdrawal: number;
};

type AccountProfileRow = {
  id: number;
  initialBalance: number | null;
  totalWithdrawal: number;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

function calculateProfitLossPercent(baseBalance: number, profit: number, loss: number) {
  if (baseBalance <= 0) {
    return 0;
  }

  return roundCurrency(((profit - loss) / baseBalance) * 100);
}

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

async function getLegacyAccountDefaults(): Promise<AccountSnapshot> {
  const [firstTrade, aggregate] = await Promise.all([
    prisma.trade.findFirst({
      orderBy: { tradeNumber: "asc" },
    }),
    prisma.trade.aggregate({
      _sum: { withdrawal: true },
    }),
  ]);

  return {
    initialBalance:
      firstTrade && firstTrade.initialCapital > 0 ? firstTrade.initialCapital : null,
    totalWithdrawal: aggregate._sum.withdrawal ?? 0,
  };
}

async function findStoredAccountProfile(): Promise<AccountProfileRow | null> {
  const rows = await prisma.$queryRaw<AccountProfileRow[]>(Prisma.sql`
    SELECT id, "initialBalance", "totalWithdrawal"
    FROM account_profiles
    WHERE id = ${ACCOUNT_PROFILE_ID}
    LIMIT 1
  `);

  return rows[0] ?? null;
}

async function upsertStoredAccountProfile(
  initialBalance: number | null,
  totalWithdrawal: number
): Promise<AccountProfileRow | null> {
  const rows = await prisma.$queryRaw<AccountProfileRow[]>(Prisma.sql`
    INSERT INTO account_profiles (
      id,
      "initialBalance",
      "totalWithdrawal",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${ACCOUNT_PROFILE_ID},
      ${initialBalance},
      ${totalWithdrawal},
      NOW(),
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      "initialBalance" = EXCLUDED."initialBalance",
      "totalWithdrawal" = EXCLUDED."totalWithdrawal",
      "updatedAt" = NOW()
    RETURNING id, "initialBalance", "totalWithdrawal"
  `);

  return rows[0] ?? null;
}

async function ensureAccountProfile() {
  const existingProfile = await findStoredAccountProfile();

  if (existingProfile) {
    return existingProfile;
  }

  const legacyDefaults = await getLegacyAccountDefaults();
  if (legacyDefaults.initialBalance === null && legacyDefaults.totalWithdrawal === 0) {
    return null;
  }

  return upsertStoredAccountProfile(
    legacyDefaults.initialBalance,
    legacyDefaults.totalWithdrawal
  );
}

async function getAccountSnapshot(): Promise<AccountSnapshot> {
  const profile = await ensureAccountProfile();
  return {
    initialBalance: profile?.initialBalance ?? null,
    totalWithdrawal: profile?.totalWithdrawal ?? 0,
  };
}

async function syncTradeSnapshots(initialBalance: number | null) {
  const trades = await prisma.trade.findMany({
    orderBy: { tradeNumber: "asc" },
  });

  let runningBalance = initialBalance ?? 0;

  for (let index = 0; index < trades.length; index += 1) {
    const trade = trades[index];
    const baseBalance = runningBalance;
    const profitLossPercent = calculateProfitLossPercent(
      baseBalance,
      trade.profit,
      trade.loss
    );
    runningBalance += trade.profit - trade.loss;

    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        withdrawal: 0,
        initialCapital: index === 0 && initialBalance !== null ? initialBalance : 0,
        balance: roundCurrency(runningBalance),
        profitLossPercent,
      },
    });
  }
}

async function renumberTrades(startTradeNumber: number) {
  const remainingTrades = await prisma.trade.findMany({
    where: { tradeNumber: { gt: startTradeNumber } },
    orderBy: { tradeNumber: "asc" },
  });

  for (let index = 0; index < remainingTrades.length; index += 1) {
    await prisma.trade.update({
      where: { id: remainingTrades[index].id },
      data: { tradeNumber: startTradeNumber + index },
    });
  }
}

export async function getAccountSettings() {
  const account = await getAccountSnapshot();

  return {
    initialBalance:
      account.initialBalance === null ? null : roundCurrency(account.initialBalance),
    totalWithdrawal: roundCurrency(account.totalWithdrawal),
    hasInitialBalance: account.initialBalance !== null,
    canAddTrades: account.initialBalance !== null,
  };
}

export async function updateAccountSettings(values: AccountSettingsValues) {
  try {
    const validated = accountSettingsSchema.parse(values);

    await upsertStoredAccountProfile(
      validated.initialBalance,
      validated.totalWithdrawal
    );

    await syncTradeSnapshots(validated.initialBalance);
    revalidateAppPaths();

    return { success: true, message: "Account settings updated" };
  } catch (error) {
    console.error("Update account settings error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update account settings",
    };
  }
}

export async function createTrade(values: TradeFormValues) {
  try {
    const validated = tradeFormSchema.parse(values);
    const account = await getAccountSnapshot();

    if (account.initialBalance === null) {
      return {
        success: false,
        message: "Set your initial balance on the dashboard before adding trades",
      };
    }

    const lastTrade = await prisma.trade.findFirst({
      orderBy: { tradeNumber: "desc" },
    });
    const tradeNumber = (lastTrade?.tradeNumber ?? 0) + 1;

    await prisma.trade.create({
      data: {
        tradeNumber,
        date: validated.date,
        sessionStart: validated.sessionStart,
        sessionEnd: validated.sessionEnd,
        eaName: validated.eaName,
        pair: validated.pair,
        result: validated.result,
        profit: validated.profit,
        loss: validated.loss,
        withdrawal: 0,
        initialCapital: tradeNumber === 1 ? account.initialBalance : 0,
        balance: 0,
        profitLossPercent: 0,
        notes: validated.notes || null,
      },
    });

    await syncTradeSnapshots(account.initialBalance);
    revalidateAppPaths();

    return { success: true, message: "Trade created successfully" };
  } catch (error) {
    console.error("Create trade error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: "Database error occurred" };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create trade",
    };
  }
}

export async function updateTrade(id: number, values: TradeFormValues) {
  try {
    const validated = tradeFormSchema.parse(values);
    const account = await getAccountSnapshot();

    const existingTrade = await prisma.trade.findUnique({ where: { id } });
    if (!existingTrade) {
      return { success: false, message: "Trade not found" };
    }

    await prisma.trade.update({
      where: { id },
      data: {
        date: validated.date,
        sessionStart: validated.sessionStart,
        sessionEnd: validated.sessionEnd,
        eaName: validated.eaName,
        pair: validated.pair,
        result: validated.result,
        profit: validated.profit,
        loss: validated.loss,
        withdrawal: 0,
        notes: validated.notes || null,
      },
    });

    await syncTradeSnapshots(account.initialBalance);
    revalidateAppPaths();

    return { success: true, message: "Trade updated successfully" };
  } catch (error) {
    console.error("Update trade error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update trade",
    };
  }
}

export async function deleteTrade(id: number) {
  try {
    const account = await getAccountSnapshot();
    const trade = await prisma.trade.findUnique({ where: { id } });

    if (!trade) {
      return { success: false, message: "Trade not found" };
    }

    await prisma.trade.delete({ where: { id } });
    await renumberTrades(trade.tradeNumber);
    await syncTradeSnapshots(account.initialBalance);
    revalidateAppPaths();

    return { success: true, message: "Trade deleted successfully" };
  } catch (error) {
    console.error("Delete trade error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete trade",
    };
  }
}

export async function getTrades(params?: {
  search?: string;
  eaName?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.TradeWhereInput = {};

  if (params?.eaName && params.eaName !== "all") {
    where.eaName = params.eaName;
  }

  if (params?.result && params.result !== "all") {
    where.result = params.result;
  }

  if (params?.dateFrom || params?.dateTo) {
    where.date = {};
    if (params?.dateFrom) {
      where.date.gte = new Date(params.dateFrom);
    }
    if (params?.dateTo) {
      where.date.lte = new Date(params.dateTo);
    }
  }

  if (params?.search) {
    where.OR = [
      { pair: { contains: params.search, mode: "insensitive" } },
      { eaName: { contains: params.search, mode: "insensitive" } },
      { notes: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      orderBy: { tradeNumber: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.trade.count({ where }),
  ]);

  return {
    trades: trades.map((trade) => ({
      ...trade,
      date: trade.date.toISOString(),
      createdAt: trade.createdAt.toISOString(),
      updatedAt: trade.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTradeById(id: number) {
  const trade = await prisma.trade.findUnique({ where: { id } });

  if (!trade) return null;

  return {
    ...trade,
    date: trade.date.toISOString(),
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
  };
}

export async function getDashboardStats() {
  const [trades, account] = await Promise.all([
    prisma.trade.findMany({
      orderBy: { tradeNumber: "asc" },
    }),
    getAccountSnapshot(),
  ]);

  const totalTrades = trades.length;
  const wins = trades.filter((trade) => trade.result === "Win");
  const losses = trades.filter((trade) => trade.result === "Lose");
  const totalWin = wins.length;
  const totalLose = losses.length;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalLoss = trades.reduce((sum, trade) => sum + trade.loss, 0);
  const netProfit = totalProfit - totalLoss;
  const winRate = totalTrades > 0 ? (totalWin / totalTrades) * 100 : 0;
  const averageWin = totalWin > 0 ? totalProfit / totalWin : 0;
  const averageLoss = totalLose > 0 ? totalLoss / totalLose : 0;

  let peakBalance = account.initialBalance ?? 0;
  let maxDrawdown = 0;
  let runningBalance = account.initialBalance ?? 0;

  for (const trade of trades) {
    runningBalance += trade.profit - trade.loss;
    peakBalance = Math.max(peakBalance, runningBalance);

    const drawdown =
      peakBalance > 0 ? ((peakBalance - runningBalance) / peakBalance) * 100 : 0;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  const currentBalance =
    account.initialBalance === null
      ? 0
      : account.initialBalance + netProfit - account.totalWithdrawal;

  return {
    hasInitialBalance: account.initialBalance !== null,
    initialBalance:
      account.initialBalance === null ? 0 : roundCurrency(account.initialBalance),
    totalTrades,
    totalWin,
    totalLose,
    winRate: roundCurrency(winRate),
    totalProfit: roundCurrency(totalProfit),
    totalLoss: roundCurrency(totalLoss),
    totalWithdrawal: roundCurrency(account.totalWithdrawal),
    netProfit: roundCurrency(netProfit),
    currentBalance: roundCurrency(currentBalance),
    peakBalance: roundCurrency(peakBalance),
    maxDrawdown: roundCurrency(maxDrawdown),
    averageWin: roundCurrency(averageWin),
    averageLoss: roundCurrency(averageLoss),
  };
}

export async function getChartData() {
  const [trades, account] = await Promise.all([
    prisma.trade.findMany({
      orderBy: { tradeNumber: "asc" },
    }),
    getAccountSnapshot(),
  ]);

  let runningBalance = account.initialBalance ?? 0;

  const equityCurve = trades.map((trade) => {
    runningBalance += trade.profit - trade.loss;

    return {
      trade: `#${trade.tradeNumber}`,
      balance: roundCurrency(runningBalance),
      date: trade.date.toISOString().split("T")[0],
    };
  });

  const totalWin = trades.filter((trade) => trade.result === "Win").length;
  const totalLose = trades.filter((trade) => trade.result === "Lose").length;
  const winLose = [
    { name: "Win", value: totalWin, fill: "#10b981" },
    { name: "Lose", value: totalLose, fill: "#ef4444" },
  ];

  const eaStats: Record<string, { profit: number; loss: number }> = {};

  for (const trade of trades) {
    if (!eaStats[trade.eaName]) {
      eaStats[trade.eaName] = { profit: 0, loss: 0 };
    }

    eaStats[trade.eaName].profit += trade.profit;
    eaStats[trade.eaName].loss += trade.loss;
  }

  const profitLoss = Object.entries(eaStats).map(([name, data]) => ({
    name,
    profit: roundCurrency(data.profit),
    loss: roundCurrency(data.loss),
  }));

  const eaSummary = Object.entries(eaStats).map(([name, data]) => {
    const eaTrades = trades.filter((trade) => trade.eaName === name);
    const eaWins = eaTrades.filter((trade) => trade.result === "Win").length;

    return {
      name,
      totalTrades: eaTrades.length,
      wins: eaWins,
      losses: eaTrades.length - eaWins,
      winRate:
        eaTrades.length > 0 ? roundCurrency((eaWins / eaTrades.length) * 100) : 0,
      totalProfit: roundCurrency(data.profit),
      totalLoss: roundCurrency(data.loss),
      netProfit: roundCurrency(data.profit - data.loss),
    };
  });

  return { equityCurve, winLose, profitLoss, eaSummary };
}

export async function getPnlCalendarData() {
  const trades = await prisma.trade.findMany({
    orderBy: [{ date: "asc" }, { tradeNumber: "asc" }],
  });

  const calendarMap = new Map<
    string,
    { date: string; pnl: number; tradeCount: number }
  >();

  for (const trade of trades) {
    const dateKey = format(trade.date, "yyyy-MM-dd");
    const existingDay = calendarMap.get(dateKey);
    const tradePnl = trade.profit - trade.loss;

    if (existingDay) {
      existingDay.pnl = roundCurrency(existingDay.pnl + tradePnl);
      existingDay.tradeCount += 1;
      continue;
    }

    calendarMap.set(dateKey, {
      date: dateKey,
      pnl: roundCurrency(tradePnl),
      tradeCount: 1,
    });
  }

  return Array.from(calendarMap.values());
}

export async function seedTrades() {
  const existingCount = await prisma.trade.count();
  if (existingCount > 0) {
    return {
      success: false,
      message: "Database already has data. Clear it first.",
    };
  }

  const sampleInitialBalance = 1000;
  const sampleTotalWithdrawal = 225;
  const sampleTrades = [
    {
      date: "2025-03-01",
      sessionStart: "08:00",
      sessionEnd: "09:15",
      eaName: "EA GODKEN",
      result: "Win",
      profit: 85,
      loss: 0,
      notes: "Strong breakout on London session",
    },
    {
      date: "2025-03-03",
      sessionStart: "09:30",
      sessionEnd: "10:20",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 120,
      loss: 0,
      notes: "Perfect entry on pullback",
    },
    {
      date: "2025-03-05",
      sessionStart: "13:00",
      sessionEnd: "14:00",
      eaName: "EA GODKEN",
      result: "Lose",
      profit: 0,
      loss: 45,
      notes: "Stopped out on news spike",
    },
    {
      date: "2025-03-07",
      sessionStart: "14:15",
      sessionEnd: "15:10",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 200,
      loss: 0,
      notes: "Excellent trend follow",
    },
    {
      date: "2025-03-08",
      sessionStart: "08:45",
      sessionEnd: "09:30",
      eaName: "EA GODKEN",
      result: "Win",
      profit: 95,
      loss: 0,
      notes: "Good scalp, account withdrawal logged on dashboard",
    },
    {
      date: "2025-03-10",
      sessionStart: "19:00",
      sessionEnd: "19:40",
      eaName: "EA MONEY PRINT",
      result: "Lose",
      profit: 0,
      loss: 60,
      notes: "Slippage during high volatility",
    },
    {
      date: "2025-03-12",
      sessionStart: "07:30",
      sessionEnd: "08:35",
      eaName: "EA GODKEN",
      result: "Win",
      profit: 150,
      loss: 0,
      notes: "Clean double-top setup",
    },
    {
      date: "2025-03-14",
      sessionStart: "10:00",
      sessionEnd: "11:10",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 180,
      loss: 0,
      notes: "Multiple TP hit, withdrawal handled in dashboard",
    },
    {
      date: "2025-03-16",
      sessionStart: "15:00",
      sessionEnd: "15:50",
      eaName: "EA GODKEN",
      result: "Lose",
      profit: 0,
      loss: 75,
      notes: "False breakout scenario",
    },
    {
      date: "2025-03-18",
      sessionStart: "09:10",
      sessionEnd: "10:05",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 110,
      loss: 0,
      notes: "Steady grind in ranging market",
    },
    {
      date: "2025-03-20",
      sessionStart: "20:30",
      sessionEnd: "21:20",
      eaName: "EA GODKEN",
      result: "Win",
      profit: 220,
      loss: 0,
      notes: "Strong NFP reaction trade",
    },
    {
      date: "2025-03-22",
      sessionStart: "11:00",
      sessionEnd: "11:45",
      eaName: "EA MONEY PRINT",
      result: "Lose",
      profit: 0,
      loss: 35,
      notes: "Small loss, tight SL",
    },
    {
      date: "2025-03-24",
      sessionStart: "06:45",
      sessionEnd: "07:20",
      eaName: "EA GODKEN",
      result: "Win",
      profit: 90,
      loss: 0,
      notes: "Asian session scalp win",
    },
    {
      date: "2025-03-26",
      sessionStart: "12:10",
      sessionEnd: "13:05",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 165,
      loss: 0,
      notes: "Beautiful trend continuation",
    },
    {
      date: "2025-03-28",
      sessionStart: "16:00",
      sessionEnd: "16:35",
      eaName: "EA GODKEN",
      result: "Lose",
      profit: 0,
      loss: 55,
      notes: "Whipsaw in choppy market",
    },
    {
      date: "2025-03-30",
      sessionStart: "08:20",
      sessionEnd: "09:25",
      eaName: "EA MONEY PRINT",
      result: "Win",
      profit: 140,
      loss: 0,
      notes: "End of month profit taking",
    },
  ] as const;

  await upsertStoredAccountProfile(
    sampleInitialBalance,
    sampleTotalWithdrawal
  );

  let runningBalance = sampleInitialBalance;

  for (let index = 0; index < sampleTrades.length; index += 1) {
    const trade = sampleTrades[index];
    const baseBalance = runningBalance;
    const profitLossPercent = calculateProfitLossPercent(
      baseBalance,
      trade.profit,
      trade.loss
    );
    runningBalance += trade.profit - trade.loss;

    await prisma.trade.create({
      data: {
        tradeNumber: index + 1,
        date: new Date(trade.date),
        sessionStart: trade.sessionStart,
        sessionEnd: trade.sessionEnd,
        eaName: trade.eaName,
        pair: "XAUUSD",
        result: trade.result,
        profit: trade.profit,
        loss: trade.loss,
        withdrawal: 0,
        initialCapital: index === 0 ? sampleInitialBalance : 0,
        balance: roundCurrency(runningBalance),
        profitLossPercent,
        notes: trade.notes,
      },
    });
  }

  revalidateAppPaths();
  return {
    success: true,
    message: `Successfully seeded ${sampleTrades.length} trades`,
  };
}

export async function clearAllTrades() {
  await prisma.trade.deleteMany();
  revalidateAppPaths();
  return { success: true, message: "All trades cleared" };
}
