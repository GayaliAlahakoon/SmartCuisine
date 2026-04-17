"use client";

import { ChevronLeft, Clock, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecipeListProps {
  recipes: any[];
  onSelect: (recipe: any) => void;
  onBack: () => void;
}

export function RecipeList({ recipes, onSelect, onBack }: RecipeListProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 text-foreground-muted hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Your Recipes</h2>
        <p className="text-lg text-foreground-muted">
          Found {recipes.length} delicious recipes for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <button
            key={index}
            onClick={() => onSelect(recipe)}
            className="group relative overflow-hidden rounded-2xl bg-surface-elevated border border-border hover:border-primary/50 transition-all hover:scale-[1.02] text-left"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground pr-4 text-balance">
                  {recipe.name || recipe.title}
                </h3>
                <div className="text-2xl shrink-0">
                  {index % 5 === 0
                    ? "🍝"
                    : index % 5 === 1
                    ? "🍲"
                    : index % 5 === 2
                    ? "🥘"
                    : index % 5 === 3
                    ? "🍛"
                    : "🥗"}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.cooking_time || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  <span>{recipe.difficulty || "N/A"}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-foreground-subtle">
                  {recipe.ingredients?.length || 0} ingredients
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
