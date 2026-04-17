import {
  HelpCircle,
  ChefHat,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Help & Guide</h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Learn how to use SmartCuisine to discover recipes and check for
              allergens
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-primary" />
              How It Works
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Add Your Ingredients
                  </h3>
                  <p className="text-foreground-muted">
                    Type in the ingredients you have available. You can add as
                    many as you like - the more ingredients, the better the
                    recommendations!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Choose Your Path
                  </h3>
                  <p className="text-foreground-muted mb-2">
                    Select one of two options:
                  </p>
                  <ul className="space-y-2 text-foreground-muted">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          Quick Recipes:
                        </strong>{" "}
                        Get instant recipe suggestions based on your ingredients
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          Cuisine Prediction:
                        </strong>{" "}
                        Let our AI predict which cuisines match your
                        ingredients, then choose your favorite
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Browse Recipes
                  </h3>
                  <p className="text-foreground-muted">
                    View a curated list of recipes that match your ingredients
                    and preferences. Each recipe card shows the dish name,
                    cooking time, and difficulty level.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Check Allergens
                  </h3>
                  <p className="text-foreground-muted">
                    Click on any recipe to view full details. Our system
                    automatically checks all ingredients for common allergens
                    and highlights any concerns.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Get Smart Substitutions
                  </h3>
                  <p className="text-foreground-muted">
                    If allergens are detected, our AI suggests safe ingredient
                    substitutions that maintain the flavor and texture of the
                    original recipe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Allergen Information */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Allergen Detection
            </h2>

            <p className="text-foreground-muted">
              SmartCuisine checks for the following common allergens in all
              recipes:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Peanuts",
                "Tree Nuts",
                "Milk & Dairy",
                "Eggs",
                "Fish",
                "Shellfish",
                "Soy",
                "Wheat & Gluten",
                "Sesame",
                "Sulfites",
              ].map((allergen) => (
                <div key={allergen} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-foreground-muted">{allergen}</span>
                </div>
              ))}
            </div>

            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground-muted">
                <strong className="text-warning">Important:</strong> While we
                strive for accuracy, always verify ingredient labels and consult
                with healthcare professionals for severe allergies.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-accent" />
              Pro Tips
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground-muted">
                  <strong className="text-foreground">Be specific:</strong>{" "}
                  Instead of "meat", try "chicken breast" or "ground beef" for
                  better results
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground-muted">
                  <strong className="text-foreground">Include staples:</strong>{" "}
                  Don't forget common ingredients like salt, pepper, oil, and
                  garlic
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground-muted">
                  <strong className="text-foreground">
                    Try cuisine prediction:
                  </strong>{" "}
                  It's a great way to discover new dishes from different
                  cultures
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground-muted">
                  <strong className="text-foreground">
                    Check substitutions:
                  </strong>{" "}
                  Even if you don't have allergies, substitution suggestions can
                  help when you're missing an ingredient
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
