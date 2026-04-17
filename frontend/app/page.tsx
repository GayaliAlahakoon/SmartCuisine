"use client";

import { useState } from "react";
import { IngredientInput } from "@/components/ingredient-input";
import { CuisineSelector } from "@/components/cuisine-selector";
import { RecipeList } from "@/components/recipe-list";
import { RecipeDetail } from "@/components/recipe-detail";
import { SubstitutionPanel } from "@/components/substitution-panel";
import { CookingLoader } from "@/components/cooking-loader";
import { Sparkles, Shield, Lightbulb, ChefHat } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<
    "intro" | "input" | "cuisine" | "recipes" | "detail"
  >("intro");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<
    Array<{ cuisine: string; probability: number }>
  >([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [allergenMap, setAllergenMap] = useState<Record<string, string[]>>({});
  const [substitutions, setSubstitutions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [pathChoice, setPathChoice] = useState<"quick" | "cuisine">("quick");

  // --- Handlers ---

  const handleIngredientsSubmit = async (
    ings: string[],
    choice: "quick" | "cuisine"
  ) => {
    setIngredients(ings);
    setPathChoice(choice);
    setLoading(true);
    try {
      if (choice === "quick") {
        const res = await fetch("/api/quick-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients: ings }),
        });
        const data = await res.json();
        setRecipes(data.recipes || []);
        setStep("recipes");
      } else {
        const res = await fetch("/api/predict-cuisine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients: ings }),
        });
        const data = await res.json();
        const transformed = (data.predictions || []).map(
          ([cuisine, probability]: [string, number]) => ({
            cuisine,
            probability,
          })
        );
        setCuisines(transformed);
        setStep("cuisine");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineSelect = async (cuisine: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-cuisine-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          cuisine_type: cuisine,
          num_recipes: 5,
        }),
      });
      const data = await res.json();
      setRecipes(data.recipes || []);
      setStep("recipes");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = async (recipe: any) => {
    setSelectedRecipe(recipe);
    setLoading(true);
    try {
      const allergenResponse = await fetch("/api/allergen-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: recipe.ingredients }),
      });
      const allergenData = await allergenResponse.json();
      setAllergenMap(allergenData.allergen_details || {});

      const hasAllergens = Object.values(
        allergenData.allergen_details || {}
      ).some((a: any) => a && a.length > 0);
      if (hasAllergens) {
        const allergicIngredients = Object.entries(
          allergenData.allergen_details || {}
        )
          .filter(([_, allergens]: any) => allergens && allergens.length > 0)
          .map(([ing]) => ing);

        const subsResults = await Promise.all(
          allergicIngredients.map(async (ing) => {
            const res = await fetch("/api/substitute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ingredient: ing,
                recipe_name: recipe.name || recipe.title,
                reason: "allergen detected",
              }),
            });
            return { ingredient: ing, data: await res.json() };
          })
        );
        const subsMap: Record<string, any> = {};
        subsResults.forEach(
          ({ ingredient, data }) => (subsMap[ingredient] = data)
        );
        setSubstitutions(subsMap);
      }
      setStep("detail");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "detail") {
      setStep("recipes");
      setSelectedRecipe(null);
      setAllergenMap({});
      setSubstitutions({});
    } else if (step === "recipes") {
      if (pathChoice === "cuisine") setStep("cuisine");
      else setStep("input");
      setRecipes([]);
    } else if (step === "cuisine") {
      setStep("input");
      setCuisines([]);
    } else if (step === "input") {
      setStep("intro");
      setIngredients([]);
    }
  };

  const handleStartOver = () => {
    setStep("intro");
    setIngredients([]);
    setCuisines([]);
    setRecipes([]);
    setSelectedRecipe(null);
    setAllergenMap({});
    setSubstitutions({});
  };

  // --- UI ---

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <main className="relative container mx-auto px-6 py-16 md:py-24">
        {loading && <CookingLoader />}

        {/* STEP: INTRO / HERO */}
        {!loading && step === "intro" && (
          <section className="text-center space-y-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Cooking Assistant
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
              Turn Your Ingredients Into Magic
            </h1>

            <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
              Discover personalized recipes, predict cuisines, detect allergens,
              and get smart substitutions—all from your ingredient list.
            </p>

            <button
              onClick={() => setStep("input")}
              className="px-8 py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              Start Cooking
            </button>

            {/* Feature preview */}
            <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
              <FeatureCard
                icon={<ChefHat className="w-6 h-6 text-white" />}
                title="Cuisine Prediction"
                desc="AI suggests cuisines that match your ingredients."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-white" />}
                title="Allergen Detection"
                desc="Instantly checks ingredients for common allergens."
              />
              <FeatureCard
                icon={<Lightbulb className="w-6 h-6 text-white" />}
                title="Smart Substitutions"
                desc="Find safe and tasty ingredient alternatives."
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-24 p-10 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 max-w-4xl mx-auto">
              <Stat value="40,000+" label="Recipes" />
              <Stat value="90%" label="Accuracy Rate" bordered />
              <Stat value="7" label="Cuisine Types" />
            </div>
          </section>
        )}

        {/* STEP: INGREDIENT INPUT */}
        {!loading && step === "input" && (
          <section className="animate-slide-up max-w-3xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-semibold bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
              Let's Get Started!
            </h2>
            <p className="text-foreground-muted text-lg"></p>
            <IngredientInput onSubmit={handleIngredientsSubmit} />
            <button
              onClick={() => setStep("intro")}
              className="text-sm text-foreground-muted underline hover:text-primary"
            >
              Back to Home
            </button>
          </section>
        )}

        {/* STEP: CUISINE SELECTION */}
        {!loading && step === "cuisine" && (
          <div className="animate-slide-up">
            <CuisineSelector
              cuisines={cuisines}
              onSelect={handleCuisineSelect}
              onBack={handleBack}
            />
          </div>
        )}

        {/* STEP: RECIPES LIST */}
        {!loading && step === "recipes" && (
          <div className="animate-slide-up">
            <RecipeList
              recipes={recipes}
              onSelect={handleRecipeSelect}
              onBack={handleBack}
            />
          </div>
        )}

        {/* STEP: RECIPE DETAIL */}
        {!loading && step === "detail" && selectedRecipe && (
          <div className="space-y-6 animate-slide-up">
            <RecipeDetail
              recipe={selectedRecipe}
              allergenMap={allergenMap}
              onBack={handleBack}
            />
            {Object.keys(substitutions).length > 0 && (
              <SubstitutionPanel substitutions={substitutions} />
            )}
          </div>
        )}

        {/* Universal Start Over */}
        {!loading && step !== "intro" && (
          <div className="flex justify-center mt-16">
            <button
              onClick={handleStartOver}
              className="px-6 py-3 rounded-lg bg-surface-elevated hover:bg-surface text-foreground-muted hover:text-foreground transition-all hover:scale-105"
            >
              Start Over
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Reusable Mini Components ---

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group p-8 rounded-2xl bg-gradient-to-br from-surface-elevated to-surface border border-border hover:border-primary/50 hover:scale-105 transition-all text-left">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({
  value,
  label,
  bordered,
}: {
  value: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`text-center ${bordered ? "border-x border-primary/20" : ""}`}
    >
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
        {value}
      </div>
      <div className="text-sm text-foreground-muted">{label}</div>
    </div>
  );
}
