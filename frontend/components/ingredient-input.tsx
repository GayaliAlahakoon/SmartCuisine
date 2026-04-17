"use client";

import type React from "react";
import { useState } from "react";
import { Plus, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSuggestions, validateIngredient } from "@/lib/ingredients";

interface IngredientInputProps {
  onSubmit: (ingredients: string[], choice: "quick" | "cuisine") => void;
}

export function IngredientInput({ onSubmit }: IngredientInputProps) {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    suggestion?: string;
  } | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setSelectedSuggestionIndex(-1);

    if (value.trim()) {
      const sug = getSuggestions(value);
      setSuggestions(sug);
      setShowSuggestions(true);

      const val = validateIngredient(value);
      setValidation(val);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setValidation(null);
    }
  };

  const handleAdd = (ingredientToAdd?: string) => {
    const finalIngredient = ingredientToAdd || input.trim();
    if (!finalIngredient) return;

    if (!ingredientToAdd && validation?.suggestion) {
      setIngredients([...ingredients, validation.suggestion]);
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);
      setValidation(null);
      return;
    }

    setIngredients([...ingredients, finalIngredient]);
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setValidation(null);
  };

  const handleRemove = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        handleAdd(suggestions[selectedSuggestionIndex]);
      } else {
        handleAdd();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 text-balance">
          What ingredients do you have?
        </h2>
        <p
          className={`text-lg text-foreground-muted ${
            ingredients.length < 5 ? " font-semibold animate-pulse" : ""
          }`}
        >
          Please make sure to enter at least 5 ingredients, or else WE CAN'T
          COOK
        </p>
      </div>

      <div className="gradient-surface rounded-2xl p-8 border border-border/50 backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => input.trim() && setShowSuggestions(true)}
                placeholder="Enter an ingredient (e.g., chicken, tomatoes, rice)"
                className="w-full bg-surface-elevated border-border text-white placeholder:text-gray-300 text-lg"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleAdd(suggestion)}
                      className={`w-full text-left px-4 py-3 transition-colors text-sm font-medium ${
                        index === selectedSuggestionIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-surface-elevated/80 text-foreground"
                      } ${index === 0 ? "rounded-t-lg" : ""} ${
                        index === suggestions.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Solid green Add button */}
            <Button
              onClick={() => handleAdd()}
              disabled={!input.trim()}
              className="text-white font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: "#6BBE45",
                borderColor: "#6BBE45",
                color: "white",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#7FD153";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#6BBE45";
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {input.trim() &&
            validation &&
            !validation.isValid &&
            validation.suggestion && (
              <div className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                <span>Did you mean</span>
                <button
                  onClick={() => handleAdd(validation.suggestion)}
                  className="font-semibold underline hover:text-amber-700 transition-colors"
                >
                  {validation.suggestion}
                </button>
                <span>?</span>
              </div>
            )}
        </div>

        {ingredients.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
              Added Ingredients ({ingredients.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full border border-primary/20 hover:border-primary/50 transition-colors group"
                >
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-white">{ing}</span>
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-foreground-subtle hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-foreground-muted text-center mb-4">
              Choose how you'd like to proceed:
            </p>
            {ingredients.length < 5 && (
              <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">
                  Add {5 - ingredients.length} more{" "}
                  {5 - ingredients.length === 1 ? "ingredient" : "ingredients"}{" "}
                  to continue
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onSubmit(ingredients, "quick")}
                disabled={ingredients.length < 5}
                className={`group relative overflow-hidden rounded-xl p-6 bg-surface-elevated border border-border transition-all hover:scale-[1.02] ${
                  ingredients.length < 5
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="relative z-10">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Quick Recipes
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Get instant recipe suggestions based on your ingredients
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => onSubmit(ingredients, "cuisine")}
                disabled={ingredients.length < 5}
                className={`group relative overflow-hidden rounded-xl p-6 bg-surface-elevated border border-border transition-all hover:scale-[1.02] ${
                  ingredients.length < 5
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-secondary/50"
                }`}
              >
                <div className="relative z-10">
                  <div className="text-3xl mb-3">🌍</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Cuisine Analysis
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Discover cuisines and get tailored recipe recommendations
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
