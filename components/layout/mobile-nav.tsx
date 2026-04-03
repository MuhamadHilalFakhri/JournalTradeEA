"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "PnL Calendar", href: "/pnl-calendar", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              TradeJournal
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              EA / Bot Tracker
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-400 border border-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-indigo-400")} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
