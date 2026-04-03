"use client";

import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
