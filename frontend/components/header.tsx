"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, HelpCircle } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/model-performance", label: "Model Performance", icon: BarChart3 },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <header className="relative border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-2xl">🥗</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                SmartCuisine
              </h1>
              <p className="text-sm text-foreground-muted">
                Smart Recipe & Allergen Assistant
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-surface-elevated hover:bg-surface text-foreground-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
