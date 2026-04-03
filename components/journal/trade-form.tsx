"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tradeFormSchema, TradeFormValues, EA_NAMES, TRADE_RESULTS, DEFAULT_PAIR } from "@/lib/validations/trade";
import { createTrade, updateTrade } from "@/actions/trade-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface TradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTrade?: {
    id: number;
    tradeNumber: number;
    date: string;
    sessionStart: string | null;
    sessionEnd: string | null;
    eaName: string;
    pair: string;
    result: string;
    profit: number;
    loss: number;
    profitLossPercent: number;
    notes: string | null;
  } | null;
  onSuccess?: () => void;
}

export function TradeForm({ open, onOpenChange, editTrade, onSuccess }: TradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editTrade;

  const toUtcDateOnly = (value: Date) =>
    new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema) as Resolver<TradeFormValues>,
    defaultValues: {
      date: new Date(),
      sessionStart: "09:00",
      sessionEnd: "10:00",
      eaName: "EA GODKEN",
      pair: DEFAULT_PAIR,
      result: "Win",
      profit: 0,
      loss: 0,
      notes: "",
    },
  });

  const watchProfit = form.watch("profit");
  const watchLoss = form.watch("loss");
  const watchResult = form.watch("result");

  // Reset form when dialog opens/closes or editTrade changes
  useEffect(() => {
    if (open && editTrade) {
      form.reset({
        date: parseISO(editTrade.date),
        sessionStart: editTrade.sessionStart || "09:00",
        sessionEnd: editTrade.sessionEnd || "10:00",
        eaName: editTrade.eaName as typeof EA_NAMES[number],
        pair: editTrade.pair,
        result: editTrade.result as typeof TRADE_RESULTS[number],
        profit: editTrade.profit,
        loss: editTrade.loss,
        notes: editTrade.notes || "",
      });
    } else if (open && !editTrade) {
      form.reset({
        date: new Date(),
        sessionStart: "09:00",
        sessionEnd: "10:00",
        eaName: "EA GODKEN",
        pair: DEFAULT_PAIR,
        result: "Win",
        profit: 0,
        loss: 0,
        notes: "",
      });
    }
  }, [open, editTrade, form]);

  // Auto-disable profit/loss based on which is filled
  useEffect(() => {
    if (watchProfit > 0) {
      form.setValue("loss", 0);
    }
  }, [watchProfit, form]);

  useEffect(() => {
    if (watchLoss > 0) {
      form.setValue("profit", 0);
    }
  }, [watchLoss, form]);

  useEffect(() => {
    if (watchResult === "Win") {
      form.setValue("loss", 0);
      return;
    }

    form.setValue("profit", 0);
  }, [watchResult, form]);

  const onSubmit = async (values: TradeFormValues) => {
    setIsSubmitting(true);
    try {
      const normalizedValues: TradeFormValues = {
        ...values,
        date: toUtcDateOnly(values.date),
      };

      const result = isEditing
        ? await updateTrade(editTrade!.id, normalizedValues)
        : await createTrade(normalizedValues);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? `Edit Trade #${editTrade?.tradeNumber}` : "Add New Trade"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Row 1: Date + EA Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("date")
                        ? format(form.watch("date"), "PPP")
                        : "Pick a date"}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-xs text-red-400">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* EA Name */}
            <div className="space-y-2">
              <Label>EA Name *</Label>
              <Select
                value={form.watch("eaName")}
                onValueChange={(v) => form.setValue("eaName", v as typeof EA_NAMES[number])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select EA" />
                </SelectTrigger>
                <SelectContent>
                  {EA_NAMES.map((ea) => (
                    <SelectItem key={ea} value={ea}>
                      {ea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.eaName && (
                <p className="text-xs text-red-400">{form.formState.errors.eaName.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session Start *</Label>
              <Input type="time" {...form.register("sessionStart")} />
              {form.formState.errors.sessionStart && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.sessionStart.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Session End *</Label>
              <Input type="time" {...form.register("sessionEnd")} />
              {form.formState.errors.sessionEnd && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.sessionEnd.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Pair + Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pair */}
            <div className="space-y-2">
              <Label>Pair / Asset *</Label>
              <Input
                {...form.register("pair")}
                placeholder="XAUUSD"
                className="uppercase"
              />
              {form.formState.errors.pair && (
                <p className="text-xs text-red-400">{form.formState.errors.pair.message}</p>
              )}
            </div>

            {/* Result */}
            <div className="space-y-2">
              <Label>Result *</Label>
              <Select
                value={form.watch("result")}
                onValueChange={(v) => form.setValue("result", v as typeof TRADE_RESULTS[number])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className={cn(
                        "font-medium",
                        r === "Win" ? "text-emerald-500" : "text-red-500"
                      )}>
                        {r}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Profit + Loss */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profit */}
            <div className="space-y-2">
              <Label className={cn(watchLoss > 0 && "text-muted-foreground")}>
                Profit ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register("profit", { valueAsNumber: true })}
                disabled={watchResult === "Lose" || watchLoss > 0}
                placeholder={watchResult === "Lose" ? "Disabled for Lose result" : "0.00"}
                className={cn((watchResult === "Lose" || watchLoss > 0) && "opacity-50")}
              />
              {form.formState.errors.profit && (
                <p className="text-xs text-red-400">{form.formState.errors.profit.message}</p>
              )}
            </div>

            {/* Loss */}
            <div className="space-y-2">
              <Label className={cn(watchProfit > 0 && "text-muted-foreground")}>
                Loss ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register("loss", { valueAsNumber: true })}
                disabled={watchResult === "Win" || watchProfit > 0}
                placeholder={watchResult === "Win" ? "Disabled for Win result" : "0.00"}
                className={cn((watchResult === "Win" || watchProfit > 0) && "opacity-50")}
              />
              {form.formState.errors.loss && (
                <p className="text-xs text-red-400">{form.formState.errors.loss.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            P/L % dihitung otomatis dari balance sebelum trade dan nominal profit/loss.
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Add notes about this trade..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isEditing ? "Update Trade" : "Save Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
