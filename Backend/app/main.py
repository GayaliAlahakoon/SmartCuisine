from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from app.utils import predict_cuisine, check_allergens
from app.llm_service import (
    generate_quick_recipes,
    generate_cuisine_specific_recipes,
    suggest_ingredient_substitution
)
from app.logger import logger, RequestTimer
from app.rate_limiter import RateLimitMiddleware, rate_limiter, concurrency_limiter
import asyncio
from fastapi.middleware.cors import CORSMiddleware

# FastAPI app setup
app = FastAPI(
    title="SmartCuisine API",
    description="Cuisine & Allergen Prediction with Recipe Generation",
    version="2.0.0"
)

# CORS setup
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter middleware
app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)


# Request models
class IngredientsRequest(BaseModel):
    ingredients: List[str]


class CuisineRecipeRequest(BaseModel):
    ingredients: List[str]
    cuisine_type: str
    num_recipes: Optional[int] = 5


class SubstituteRequest(BaseModel):
    ingredient: str
    recipe_name: str
    reason: Optional[str] = "allergen detected"


@app.get("/")
def root():
    return {
        "message": "SmartCuisine API is running!",
        "version": "2.0.0",
        "rate_limiting": {
            "enabled": True,
            "max_requests": 10,
            "window_seconds": 120,
            "protected_endpoints": ["/substitute", "/quick-recipes", "/generate-cuisine-recipes", "/cuisine-recipes"]
        },
        "endpoints": {
            "quick_recipes": "POST /quick-recipes - Generate diverse recipes instantly",
            "predict_cuisine": "POST /predict-cuisine - Analyze cuisine type",
            "cuisine_recipes": "POST /cuisine-recipes - Full flow: predict + generate + check allergens",
            "generate_cuisine_recipes": "POST /generate-cuisine-recipes - Generate cuisine-specific recipes",
            "allergen_check": "POST /allergen-check - Check allergens in ingredients",
            "substitute": "POST /substitute - Get ingredient substitutions"
        }
    }


@app.post("/quick-recipes")
async def quick_recipes(data: IngredientsRequest):
    # Generate diverse quick recipes using LLM
    with RequestTimer() as timer:
        logger.header("Quick Recipes", data.ingredients)
        try:
            async with concurrency_limiter:
                logger.info("Generating diverse recipes...")
                recipes = await asyncio.to_thread(
                    generate_quick_recipes,
                    data.ingredients,
                    num_recipes=5
                )
                logger.recipe_generated(len(recipes))

            # Check allergens
            logger.divider()
            recipes_with_allergens = []
            for idx, recipe in enumerate(recipes, 1):
                logger.allergen_check_start(idx, recipe["name"])
                allergens = await asyncio.to_thread(check_allergens, recipe["ingredients"])
                recipe["allergens"] = allergens

                all_allergens = []
                for ing_allergens in allergens.values():
                    all_allergens.extend(ing_allergens)
                all_allergens = list(set(all_allergens))
                logger.allergen_detected(all_allergens)

                recipe["has_allergens"] = len(all_allergens) > 0
                recipes_with_allergens.append(recipe)

            logger.footer(timer.elapsed())
            return {
                "path": "Quick Recipes",
                "input_ingredients": data.ingredients,
                "recipes": recipes_with_allergens,
                "total_recipes": len(recipes_with_allergens)
            }
        except Exception as e:
            logger.error(f"Quick recipes generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-cuisine")
async def cuisine_analysis(data: IngredientsRequest):
    # Predict cuisine type using ML model
    with RequestTimer() as timer:
        logger.header("Cuisine Prediction", data.ingredients)
        try:
            predictions = await asyncio.to_thread(predict_cuisine, data.ingredients, top_n=3)
            logger.cuisine_prediction(predictions)
            logger.footer(timer.elapsed())
            return {
                "path": "Cuisine Analysis",
                "input_ingredients": data.ingredients,
                "predictions": predictions,
                "message": "Select a cuisine to generate recipes"
            }
        except Exception as e:
            logger.error(f"Cuisine analysis failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-cuisine-recipes")
async def generate_cuisine_recipes_endpoint(data: CuisineRecipeRequest):
    # Generate cuisine-specific recipes based on selected cuisine
    with RequestTimer() as timer:
        logger.header(f"Cuisine-Specific Recipes ({data.cuisine_type})", data.ingredients)
        try:
            async with concurrency_limiter:
                logger.info(f"Generating {data.cuisine_type} recipes...")
                recipes = await asyncio.to_thread(
                    generate_cuisine_specific_recipes,
                    data.ingredients,
                    data.cuisine_type,
                    num_recipes=data.num_recipes
                )
                logger.recipe_generated(len(recipes), data.cuisine_type)

            # Check allergens
            logger.divider()
            recipes_with_allergens = []
            for idx, recipe in enumerate(recipes, 1):
                logger.allergen_check_start(idx, recipe["name"])
                allergens = await asyncio.to_thread(check_allergens, recipe["ingredients"])
                recipe["allergens"] = allergens

                all_allergens = []
                for ing_allergens in allergens.values():
                    all_allergens.extend(ing_allergens)
                all_allergens = list(set(all_allergens))
                logger.allergen_detected(all_allergens)

                recipe["has_allergens"] = len(all_allergens) > 0
                recipes_with_allergens.append(recipe)

            logger.footer(timer.elapsed())
            return {
                "path": "Cuisine-Specific Recipes",
                "cuisine_type": data.cuisine_type,
                "input_ingredients": data.ingredients,
                "recipes": recipes_with_allergens,
                "total_recipes": len(recipes_with_allergens)
            }
        except Exception as e:
            logger.error(f"Cuisine recipe generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/allergen-check")
async def allergen_analysis(data: IngredientsRequest):
    # Check allergens in ingredients
    with RequestTimer() as timer:
        logger.header("Allergen Check", data.ingredients)
        try:
            results = await asyncio.to_thread(check_allergens, data.ingredients)
            allergens_found = {k: v for k, v in results.items() if len(v) > 0}
            if allergens_found:
                all_allergens = []
                for ing_allergens in allergens_found.values():
                    all_allergens.extend(ing_allergens)
                all_allergens = list(set(all_allergens))
                logger.allergen_detected(all_allergens)
            else:
                logger.success("No allergens detected")

            logger.footer(timer.elapsed())
            return {
                "input_ingredients": data.ingredients,
                "allergen_details": results,
                "allergens_found": allergens_found,
                "has_allergens": len(allergens_found) > 0
            }
        except Exception as e:
            logger.error(f"Allergen check failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/substitute")
async def suggest_substitution(data: SubstituteRequest):
    # Suggest ingredient substitution using LLM
    with RequestTimer() as timer:
        logger.header("Ingredient Substitution", [data.ingredient])
        logger.info(f"Recipe: {data.recipe_name}, Reason: {data.reason}")
        try:
            async with concurrency_limiter:
                substitution = await asyncio.to_thread(
                    suggest_ingredient_substitution,
                    data.ingredient,
                    data.recipe_name,
                    data.reason
                )
            logger.substitution_suggested(data.ingredient, substitution.get("substitute", "N/A"))
            logger.footer(timer.elapsed())
            return substitution
        except Exception as e:
            logger.error(f"Substitution failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/cuisine-recipes")
async def cuisine_recipes(data: IngredientsRequest):
    # Full flow: predict cuisine, generate recipes, check allergens
    with RequestTimer() as timer:
        logger.header("Complete Cuisine Flow", data.ingredients)
        try:
            logger.info("Analyzing cuisine type...")
            predictions = await asyncio.to_thread(predict_cuisine, data.ingredients, top_n=3)
            logger.cuisine_prediction(predictions)

            selected_cuisine = predictions[0][0]
            logger.info(f"Auto-selected cuisine: {selected_cuisine}")
            logger.divider()

            async with concurrency_limiter:
                logger.info(f"Generating {selected_cuisine} recipes...")
                recipes = await asyncio.to_thread(
                    generate_cuisine_specific_recipes,
                    data.ingredients,
                    selected_cuisine,
                    num_recipes=5
                )
                logger.recipe_generated(len(recipes), selected_cuisine)

            logger.divider()
            recipes_with_allergens = []
            for idx, recipe in enumerate(recipes, 1):
                logger.allergen_check_start(idx, recipe["name"])
                allergens = await asyncio.to_thread(check_allergens, recipe["ingredients"])
                recipe["allergens"] = allergens

                all_allergens = []
                for ing_allergens in allergens.values():
                    all_allergens.extend(ing_allergens)
                all_allergens = list(set(all_allergens))
                logger.allergen_detected(all_allergens)

                recipe["has_allergens"] = len(all_allergens) > 0
                recipes_with_allergens.append(recipe)

            logger.footer(timer.elapsed())
            return {
                "flow": "Complete Cuisine Analysis Flow",
                "input_ingredients": data.ingredients,
                "cuisine_predictions": predictions,
                "selected_cuisine": selected_cuisine,
                "recipes": recipes_with_allergens,
                "total_recipes": len(recipes_with_allergens)
            }
        except Exception as e:
            logger.error(f"Cuisine recipes flow failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    # Startup logs
    logger.info("SmartCuisine API started with rate limiting enabled")
    logger.info("Rate limit: 10 requests per 120 seconds")
    logger.info("Max concurrent LLM operations: 5")


@app.on_event("shutdown")
async def shutdown_event():
    # Cleanup logs
    logger.info("SmartCuisine API shutting down")
