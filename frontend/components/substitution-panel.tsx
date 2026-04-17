"use client";

import { Lightbulb } from "lucide-react";

interface SubstitutionPanelProps {
  substitutions: Record<string, any>;
}

export function SubstitutionPanel({ substitutions }: SubstitutionPanelProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="gradient-surface rounded-2xl p-8 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Smart Substitutions
            </h2>
            <p className="text-foreground-muted">
              Allergen-free alternatives for your recipe
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(substitutions).map(
            ([ingredient, sub]: [string, any]) => {
              const substitute =
                sub.substitute || sub.substitution || sub.text || String(sub);
              const notes = sub.notes || sub.note || "";

              return (
                <div
                  key={ingredient}
                  className="p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-foreground font-medium">
                          {ingredient}
                        </span>
                        <span className="text-foreground-subtle">→</span>
                        <span className="text-primary font-semibold">
                          {substitute}
                        </span>
                      </div>
                      {notes && (
                        <p className="text-sm text-foreground-muted">{notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
