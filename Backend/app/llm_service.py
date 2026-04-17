# app/llm_service.py
import json
import os
from typing import List, Dict, Optional
import google.generativeai as genai
from app.logger import logger

# -------------------- Gemini Setup --------------------
# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCb5pzHdM0Z2skhHqBlx4TRxgxGmqGoESA")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize model
model = genai.GenerativeModel('gemini-2.5-flash') 

# -------------------- Recipe Generation --------------------

def generate_quick_recipes(ingredients: List[str], num_recipes: int = 5) -> List[Dict]:
    prompt = f"""You are a professional chef AI assistant. Generate {num_recipes} diverse and creative recipes using the following ingredients: {', '.join(ingredients)}.

Requirements:
1. Create {num_recipes} DIFFERENT recipes with diverse cuisines (e.g., Chinese, Italian, Thai, Mexican, Indian)
2. Each recipe must be unique and distinct from others
3. Use as many of the provided ingredients as possible
4. You can add common pantry staples (salt, pepper, oil, water, etc.)
5. Try to reduce using expensive or hard-to-find ingredients
6. Try to reduce using extra ingredients not provided by the user much as possible.


For each recipe, provide:
- name: A creative, appetizing recipe name, Only use english names, Do not give names in other languages.
- cooking_time: Realistic time in minutes (e.g., "25 minutes")
- difficulty: One of: "Easy", "Medium", "Hard"
- ingredients: Complete list of ingredients with quantities (include the user's ingredients + any additions)
- steps: Detailed cooking instructions (5-8 steps)

Return ONLY a valid JSON array with {num_recipes} recipe objects. Format:
[
  {{
    "name": "Recipe Name",
    "cooking_time": "25 minutes",
    "difficulty": "Easy",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "steps": ["Step 1: ...", "Step 2: ...", ...]
  }}
]

Respond with ONLY the JSON array, no additional text."""

    try:
        logger.llm("Calling Gemini API...")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean response - remove markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        recipes = json.loads(text)
        logger.success(f"LLM response parsed successfully")
        return recipes
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.warning("Using fallback recipes")
        return _generate_fallback_recipes(ingredients, num_recipes)
    except Exception as e:
        logger.error(f"Recipe generation failed: {e}")
        logger.warning("Using fallback recipes")
        return _generate_fallback_recipes(ingredients, num_recipes)


def generate_cuisine_specific_recipes(
    ingredients: List[str], 
    cuisine_type: str, 
    num_recipes: int = 5
) -> List[Dict]:

    prompt = f"""You are a professional {cuisine_type} cuisine chef. Generate {num_recipes} authentic {cuisine_type} recipes using these ingredients: {', '.join(ingredients)}.

Requirements:
1. All recipes must be authentic {cuisine_type} dishes
2. Create {num_recipes} DIFFERENT {cuisine_type} recipes
3. Use traditional {cuisine_type} cooking techniques and flavor profiles
4. Use as many of the provided ingredients as possible
5. Add authentic {cuisine_type} ingredients and seasonings as needed
6. Try to reduce using expensive or hard-to-find ingredients
7. Try to reduce using extra ingredients not provided by the user much as possible.

For each recipe, provide:
- name: An authentic {cuisine_type} dish name in english. Do not give names in other languages.
- cooking_time: Realistic time in minutes
- difficulty: "Easy", "Medium", or "Hard"
- ingredients: Complete ingredient list with quantities (include traditional {cuisine_type} ingredients)
- steps: Detailed {cuisine_type} cooking instructions (5-8 steps)

Return ONLY a valid JSON array with {num_recipes} recipe objects:
[
  {{
    "name": "Recipe Name",
    "cooking_time": "25 minutes",
    "difficulty": "Easy",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "steps": ["Step 1: ...", "Step 2: ...", ...]
  }}
]

Respond with ONLY the JSON array, no additional text."""

    try:
        logger.llm(f"Calling Gemini API for {cuisine_type} recipes...")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean response
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        recipes = json.loads(text)
        logger.success(f"LLM response parsed successfully")
        return recipes
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.warning(f"Using fallback {cuisine_type} recipes")
        return _generate_fallback_recipes(ingredients, num_recipes, cuisine_type)
    except Exception as e:
        logger.error(f"Cuisine recipe generation failed: {e}")
        logger.warning(f"Using fallback {cuisine_type} recipes")
        return _generate_fallback_recipes(ingredients, num_recipes, cuisine_type)


# -------------------- Ingredient Substitution --------------------

def suggest_ingredient_substitution(
    ingredient: str, 
    recipe_name: str,
    reason: str = "dietary restrictions"
) -> Dict:
    """
    Suggest safe substitutions for an ingredient in a recipe
    Used when allergens are detected
    """
    prompt = f"""You are a professional chef and nutritionist. Suggest safe substitutions for an ingredient.

Context:
- Recipe: {recipe_name}
- Ingredient to replace: {ingredient}
- Reason: {reason}

Provide:
1. substitute: The best substitute ingredient
2. ratio: How to substitute (e.g., "1:1 ratio", "use half the amount")
3. notes: Any important cooking notes or flavor differences. keep it brief. short points only.
4. alternative_options: List 2-3 other possible substitutes

Return ONLY a valid JSON object:
{{
  "original_ingredient": "{ingredient}",
  "recipe_name": "{recipe_name}",
  "substitute": "substitute ingredient name",
  "ratio": "substitution ratio",
  "notes": "cooking notes and tips",
  "alternative_options": ["option 1", "option 2", "option 3"]
}}

Respond with ONLY the JSON object, no additional text."""

    try:
        logger.llm("Calling Gemini API for substitution...")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean response
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        substitution = json.loads(text)
        logger.success("Substitution generated successfully")
        return substitution
        
    except Exception as e:
        logger.error(f"Substitution suggestion failed: {e}")
        logger.warning("Returning default substitution message")
        return {
            "original_ingredient": ingredient,
            "recipe_name": recipe_name,
            "substitute": "Please consult a chef or nutritionist",
            "ratio": "N/A",
            "notes": "Unable to generate substitution automatically",
            "alternative_options": []
        }


# -------------------- Fallback Functions --------------------

def _generate_fallback_recipes(
    ingredients: List[str], 
    num_recipes: int = 5,
    cuisine_type: Optional[str] = None
) -> List[Dict]:
    """Generate simple fallback recipes when LLM fails"""
    cuisine_prefix = f"{cuisine_type} " if cuisine_type else ""
    base_recipes = [
        {
            "name": f"{cuisine_prefix}Stir Fry",
            "cooking_time": "20 minutes",
            "difficulty": "Easy",
            "ingredients": ingredients + ["oil", "salt", "pepper"],
            "steps": [
                "Heat oil in a pan or wok over high heat",
                "Add ingredients and stir fry for 5-7 minutes",
                "Season with salt and pepper",
                "Serve hot"
            ]
        },
        {
            "name": f"{cuisine_prefix}Soup",
            "cooking_time": "30 minutes",
            "difficulty": "Easy",
            "ingredients": ingredients + ["water", "salt", "pepper", "herbs"],
            "steps": [
                "Bring water to boil in a pot",
                "Add ingredients",
                "Simmer for 20 minutes",
                "Season to taste and serve"
            ]
        },
        {
            "name": f"{cuisine_prefix}Rice Bowl",
            "cooking_time": "25 minutes",
            "difficulty": "Easy",
            "ingredients": ingredients + ["rice", "soy sauce", "sesame oil"],
            "steps": [
                "Cook rice according to package instructions",
                "Prepare ingredients",
                "Combine in bowl",
                "Drizzle with sauce"
            ]
        },
        {
            "name": f"{cuisine_prefix}Salad",
            "cooking_time": "15 minutes",
            "difficulty": "Easy",
            "ingredients": ingredients + ["lettuce", "olive oil", "lemon juice"],
            "steps": [
                "Wash and prepare all ingredients",
                "Mix in a large bowl",
                "Drizzle with dressing",
                "Toss and serve"
            ]
        },
        {
            "name": f"{cuisine_prefix}Roast",
            "cooking_time": "45 minutes",
            "difficulty": "Medium",
            "ingredients": ingredients + ["olive oil", "herbs", "garlic"],
            "steps": [
                "Preheat oven to 400°F (200°C)",
                "Arrange ingredients in baking dish",
                "Drizzle with oil and season",
                "Roast for 40-45 minutes until golden",
                "Serve hot"
            ]
        }
    ]
    return base_recipes[:num_recipes]