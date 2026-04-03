import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCentCurrency(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  const defaultMaximumFractionDigits = options?.maximumFractionDigits ?? 2;
  const defaultMinimumFractionDigits =
    options?.minimumFractionDigits ??
    (defaultMaximumFractionDigits === 0 ? 0 : 0);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: defaultMinimumFractionDigits,
    maximumFractionDigits: defaultMaximumFractionDigits,
    ...options,
  }).format(value);

  return `${formatted}c`;
}
