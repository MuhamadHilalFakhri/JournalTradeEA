import { z } from "zod";

export const EA_NAMES = ["EA GODKEN", "EA MONEY PRINT"] as const;
export const TRADE_RESULTS = ["Win", "Lose"] as const;
export const DEFAULT_PAIR = "XAUUSD";
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const tradeFormSchema = z
  .object({
    date: z.coerce.date({ error: "Date is required" }),
    sessionStart: z
      .string()
      .regex(timePattern, "Start time must use HH:mm format"),
    sessionEnd: z
      .string()
      .regex(timePattern, "End time must use HH:mm format"),
    eaName: z.enum(EA_NAMES, { error: "EA Name is required" }),
    pair: z.string().min(1, "Pair is required").default(DEFAULT_PAIR),
    result: z.enum(TRADE_RESULTS, { error: "Trade result is required" }),
    profit: z.coerce.number().min(0, "Profit must be >= 0").default(0),
    loss: z.coerce.number().min(0, "Loss must be >= 0").default(0),
    notes: z.string().optional().default(""),
  })
  .refine((data) => !(data.profit > 0 && data.loss > 0), {
    message: "Cannot set both Profit and Loss. Only one is allowed.",
    path: ["profit"],
  })
  .refine(
    (data) => {
      if (data.result === "Win" && data.profit <= 0 && data.loss <= 0) return false;
      if (data.result === "Lose" && data.loss <= 0 && data.profit <= 0) return false;
      return true;
    },
    {
      message: "Please enter a profit or loss amount matching the trade result",
      path: ["profit"],
    }
  )
  .refine((data) => data.sessionEnd > data.sessionStart, {
    message: "Trading session end time must be later than start time",
    path: ["sessionEnd"],
  });

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

export const tradeFilterSchema = z.object({
  search: z.string().optional(),
  eaName: z.string().optional(),
  result: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type TradeFilterValues = z.infer<typeof tradeFilterSchema>;
