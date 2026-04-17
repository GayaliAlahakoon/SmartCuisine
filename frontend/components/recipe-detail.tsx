"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Clock, ChefHat, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RecipeDetailProps {
  recipe: any;
  allergenMap: Record<string, string[]>;
  onBack: () => void;
}

export function RecipeDetail({
  recipe,
  allergenMap,
  onBack,
}: RecipeDetailProps) {
  const [showOnlyAllergens, setShowOnlyAllergens] = useState(false);
  const hasAllergens = Object.values(allergenMap).some(
    (a) => a && a.length > 0
  );

  const ingredients = recipe.ingredients || [];
  const filteredIngredients = showOnlyAllergens
    ? ingredients.filter((i: string) => (allergenMap[i] || []).length > 0)
    : ingredients;

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6 text-foreground-muted hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to recipes
      </Button>

      <div className="gradient-surface rounded-2xl p-8 border border-border/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {recipe.name || recipe.title}
            </h1>
            <div className="flex items-center gap-6 text-foreground-muted">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{recipe.cooking_time || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span className="capitalize">{recipe.difficulty || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="text-5xl">🍽️</div>
        </div>

        {hasAllergens && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning font-semibold">
              <AlertTriangle className="w-5 h-5" />
              <span>Allergen Warning: Some ingredients contain allergens</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyAllergens(!showOnlyAllergens)}
              className="text-warning border-warning/40 hover:bg-warning/10"
            >
              {showOnlyAllergens ? (
                <>
                  <X className="w-4 h-4 mr-1" /> Show All
                </>
              ) : (
                "Show Only Allergens"
              )}
            </Button>
          </div>
        )}

        <h2 className="text-2xl font-bold text-foreground mb-4">Ingredients</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredIngredients.map((ingredient: string, index: number) => {
            const allergens = allergenMap[ingredient] || [];
            const hasAllergen = allergens.length > 0;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className={`relative p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${
                  hasAllergen
                    ? "bg-warning/10 border-warning/40 hover:shadow-warning/40"
                    : "bg-surface-elevated border-border hover:shadow-lg"
                }`}
              >
                <div className="font-medium text-white mb-2">{ingredient}</div>
                {hasAllergen ? (
                  <div className="flex items-start gap-2 text-xs text-warning font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{allergens.join(", ")}</span>
                  </div>
                ) : (
                  <div className="text-xs text-foreground-muted">Safe</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Instructions
          </h2>
          <div className="space-y-4">
            {recipe.steps?.map((step: string, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <p className="flex-1 text-foreground-muted pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
