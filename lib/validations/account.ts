import { z } from "zod";

export const accountSettingsSchema = z.object({
  initialBalance: z.coerce
    .number()
    .positive("Initial balance must be greater than 0"),
  totalWithdrawal: z.coerce
    .number()
    .min(0, "Total withdrawal must be greater than or equal to 0")
    .default(0),
});

export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;
