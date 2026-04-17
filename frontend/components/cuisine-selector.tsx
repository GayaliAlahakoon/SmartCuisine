"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CuisineSelectorProps {
  cuisines: Array<{ cuisine: string; probability: number }>;
  onSelect: (cuisine: string) => void;
  onBack: () => void;
}

export function CuisineSelector({
  cuisines,
  onSelect,
  onBack,
}: CuisineSelectorProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 text-foreground-muted hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Predicted Cuisines</h2>
        <p className="text-lg text-foreground-muted">
          Based on your ingredients, here are the best cuisine matches
        </p>
      </div>

      <div className="grid gap-4">
        {cuisines.slice(0, 3).map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item.cuisine)}
            className="group relative overflow-hidden rounded-2xl p-8 bg-surface-elevated border border-border hover:border-primary/50 transition-all hover:scale-[1.02] text-left"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">
                    {item.cuisine}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-500"
                      style={{ width: `${item.probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {item.probability}%
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
