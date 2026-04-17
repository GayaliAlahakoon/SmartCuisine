// Common ingredients database with fuzzy matching for typo correction
export const COMMON_INGREDIENTS = [
  // Proteins
  "chicken",
  "beef",
  "pork",
  "lamb",
  "fish",
  "salmon",
  "tuna",
  "shrimp",
  "eggs",
  "tofu",
  "tempeh",
  // Vegetables
  "tomato",
  "tomatoes",
  "carrot",
  "carrots",
  "onion",
  "onions",
  "garlic",
  "broccoli",
  "spinach",
  "lettuce",
  "bell pepper",
  "peppers",
  "cucumber",
  "zucchini",
  "eggplant",
  "mushroom",
  "mushrooms",
  "potato",
  "potatoes",
  "sweet potato",
  "corn",
  "peas",
  "green beans",
  "cabbage",
  "cauliflower",
  "celery",
  "kale",
  "arugula",
  // Grains & Starches
  "rice",
  "pasta",
  "bread",
  "flour",
  "oats",
  "quinoa",
  "couscous",
  "barley",
  "wheat",
  "noodles",
  // Dairy
  "milk",
  "cheese",
  "yogurt",
  "butter",
  "cream",
  "sour cream",
  "mozzarella",
  "cheddar",
  "parmesan",
  // Fruits
  "apple",
  "apples",
  "banana",
  "bananas",
  "orange",
  "oranges",
  "lemon",
  "lemons",
  "lime",
  "limes",
  "strawberry",
  "strawberries",
  "blueberry",
  "blueberries",
  "grape",
  "grapes",
  "mango",
  "pineapple",
  // Oils & Condiments
  "olive oil",
  "vegetable oil",
  "soy sauce",
  "vinegar",
  "salt",
  "pepper",
  "sugar",
  "honey",
  "ketchup",
  "mustard",
  "mayonnaise",
  "hot sauce",
  "worcestershire sauce",
  // Spices & Herbs
  "cumin",
  "paprika",
  "turmeric",
  "cinnamon",
  "basil",
  "oregano",
  "thyme",
  "rosemary",
  "parsley",
  "cilantro",
  "ginger",
  "chili",
  "chili powder",
  "cayenne",
  "black pepper",
  "white pepper",
  // Sauces & Bases
  "tomato sauce",
  "coconut milk",
  "chicken broth",
  "beef broth",
  "vegetable broth",
  "soy sauce",
  // Nuts & Seeds
  "peanut",
  "peanuts",
  "almond",
  "almonds",
  "walnut",
  "walnuts",
  "cashew",
  "cashews",
  "sesame",
  "sunflower seeds",
  "pumpkin seeds",
  // Legumes
  "beans",
  "lentils",
  "chickpeas",
  "black beans",
  "kidney beans",
  "pinto beans",
  // Seafood
  "crab",
  "lobster",
  "mussels",
  "clams",
  "oysters",
  "squid",
  "octopus",
  // Meat
  "bacon",
  "ham",
  "sausage",
  "meatballs",
  "ground beef",
  "ground chicken",
  "ground turkey",
  // Dairy Alternatives
  "almond milk",
  "oat milk",
  "soy milk",
  "coconut milk",
  // Condiments & Sauces
  "sauce",
  "gravy",
  "pesto",
  "hummus",
  "salsa",
  "guacamole",
]

// Fuzzy matching algorithm - Levenshtein distance
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

// Get suggestions for a given input
export function getSuggestions(input: string, limit = 5): string[] {
  if (!input.trim()) return []

  const inputLower = input.toLowerCase()
  const suggestions = COMMON_INGREDIENTS.map((ingredient) => ({
    ingredient,
    similarity: calculateSimilarity(input, ingredient),
  }))
    .filter((item) => item.similarity > 0.5) // Only show if >50% similar
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.ingredient)

  return suggestions
}

// Check if ingredient is valid (exists in database or is very similar)
export function validateIngredient(input: string): { isValid: boolean; suggestion?: string } {
  const inputLower = input.toLowerCase()

  // Exact match
  if (COMMON_INGREDIENTS.some((ing) => ing.toLowerCase() === inputLower)) {
    return { isValid: true }
  }

  // Fuzzy match
  const suggestions = getSuggestions(input, 1)
  if (suggestions.length > 0) {
    const similarity = calculateSimilarity(input, suggestions[0])
    if (similarity > 0.7) {
      // >70% similar, suggest correction
      return { isValid: false, suggestion: suggestions[0] }
    }
  }

  // Unknown ingredient
  return { isValid: false }
}
