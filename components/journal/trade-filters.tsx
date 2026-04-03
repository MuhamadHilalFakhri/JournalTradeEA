"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EA_NAMES, TRADE_RESULTS } from "@/lib/validations/trade";

interface TradeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  eaFilter: string;
  onEaFilterChange: (value: string) => void;
  resultFilter: string;
  onResultFilterChange: (value: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export function TradeFilters({
  search,
  onSearchChange,
  eaFilter,
  onEaFilterChange,
  resultFilter,
  onResultFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}: TradeFiltersProps) {
  const hasFilters =
    search || eaFilter !== "all" || resultFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* EA Filter */}
        <Select
          value={eaFilter}
          onValueChange={(val) => onEaFilterChange(val || "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All EAs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All EAs</SelectItem>
            {EA_NAMES.map((ea) => (
              <SelectItem key={ea} value={ea}>
                {ea}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Result Filter */}
        <Select
          value={resultFilter}
          onValueChange={(val) => onResultFilterChange(val || "all")}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Results" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            {TRADE_RESULTS.map((r) => (
              <SelectItem key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[160px] justify-start text-left font-normal text-xs",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From date"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={onDateFromChange}
              />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[160px] justify-start text-left font-normal text-xs",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={onDateToChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
