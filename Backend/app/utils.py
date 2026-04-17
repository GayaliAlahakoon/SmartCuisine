# app/utils.py

import pickle
import joblib
import numpy as np
from scipy.sparse import hstack
from app.logger import logger
import re
from difflib import get_close_matches


# Load models
with open("app/models/cuisine_model.pkl", "rb") as f:
    cuisine_model = pickle.load(f)
with open("app/models/vectorizer.pkl", "rb") as f:
    cuisine_vectorizer = pickle.load(f)
with open("app/models/label_encoder.pkl", "rb") as f:
    cuisine_label_encoder = pickle.load(f)

with open("app/models/smart_hybrid_classifier.pkl", "rb") as f:
    allergen_model = pickle.load(f)
with open("app/models/tfidf_vectorizer_smart.pkl", "rb") as f:
    allergen_vectorizer = pickle.load(f)
with open("app/models/fasttext_model_smart.pkl", "rb") as f:
    fasttext_model = pickle.load(f)
with open("app/models/label_binarizer_smart.pkl", "rb") as f:
    allergen_mlb = pickle.load(f)
with open("app/models/safety_keywords_smart.pkl", "rb") as f:
    safety_keywords = pickle.load(f)

HIGH_RISK_ALLERGENS = ['dairy', 'peanuts', 'shellfish', 'eggs', 'fish', 'tree nuts']
CONFIDENCE_THRESHOLD = 0.3

STOPWORDS = {
    'fresh', 'chopped', 'diced', 'minced', 'sliced', 'ground',
    'crushed', 'dried', 'frozen', 'canned', 'whole', 'halved',
    'quartered', 'peeled', 'seeded', 'large', 'small', 'medium',
    'cooked', 'uncooked', 'raw', 'organic', 'cup', 'cups',
    'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
    'pound', 'pounds', 'ounce', 'ounces', 'lb', 'lbs', 'oz'
}

def preprocess_ingredients(ingredients_list):
    processed = []
    for ing in ingredients_list:
        ing = ing.lower().strip()
        ing = re.sub(r'\([^)]*\)', '', ing)
        ing = re.sub(r'\d+\.?\d*', '', ing)
        ing = re.sub(r'\b(cup|tablespoon|teaspoon|pound|ounce|lb|oz)s?\b', '', ing)
        words = [w for w in ing.split() if w not in STOPWORDS and len(w) > 2]
        if words:
            processed.append(' '.join(words))
    return processed

def predict_cuisine(ingredients_list, top_n=3):
    try:
        processed = preprocess_ingredients(ingredients_list)
        text = " ".join(processed)
        X_input = cuisine_vectorizer.transform([text])
        probs = cuisine_model.predict_proba(X_input)[0]
        predictions = [(cuisine_label_encoder.classes_[i], round(float(probs[i]*100), 2))
                       for i in range(len(probs))]
        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:top_n]
    except Exception as e:
        logger.error(f"Cuisine prediction error: {e}")
        fallback = [("Chinese", 70.0), ("Thai", 20.0), ("Korean", 10.0)]
        logger.warning("Using fallback cuisine prediction")
        return fallback

def preprocess_for_fasttext(text):
    text = text.lower().replace(',', ' ').replace('(', ' ').replace(')', ' ')
    return text.split()

def ingredient_to_embedding(text):
    words = preprocess_for_fasttext(text)
    vecs = [fasttext_model.wv[w] for w in words if w in fasttext_model.wv]
    return np.mean(vecs, axis=0) if vecs else np.zeros(fasttext_model.vector_size)

# --- Non-allergens whitelist ---
NON_ALLERGENS = [
    "salt", "sugar", "pepper", "water", "oil", "vinegar",
    "lemon", "herbs", "spices", "garlic", "onion", "ginger", "coriander",
    "mushroom","garam masala", "spinach", "cucumber", "napa cabbage"
]

FUZZY_CUTOFF = 0.7  # for typo correction
CONFIDENCE_THRESHOLD = 0.6  # minimum probability for detection

# --- Logical invalid combos ---
INVALID_ALLEGEN_COMBOS = {
    "tofu": ["fish", "shellfish", "crustacean", "egg"],
    "soy": ["fish", "shellfish", "crustacean"],
    "milk": ["fish", "shellfish"],
    "cheese": ["fish", "shellfish"],
    "salt": ["fish", "shellfish", "milk", "egg", "soy", "peanut"],
    "sugar": ["fish", "shellfish", "milk", "egg", "soy", "peanut"],
    "flour": ["fish", "shellfish"],
    "rice": ["fish", "shellfish"],
}

def is_non_allergen(ingredient):
    """Check if any word in the ingredient matches the whitelist."""
    words = ingredient.lower().split()
    for w in words:
        if w in NON_ALLERGENS:
            return True
    return False


def is_invalid_combo(ingredient, allergen):
    """Check if the ingredient-allergen combination is biologically invalid."""
    ing_lower = ingredient.lower()
    for k, v in INVALID_ALLEGEN_COMBOS.items():
        if k in ing_lower and allergen.lower() in v:
            return True
    return False


def check_allergens(ingredients_list):
    results = {}

    for ing in ingredients_list:
        ing_lower = ing.lower().strip()

        # --- WHITELIST CHECK ---
        if is_non_allergen(ing_lower):
            results[ing] = []
            continue  # Skip model prediction

        try:
            # --- FEATURE EXTRACTION ---
            tfidf_feat = allergen_vectorizer.transform([ing_lower])
            ft_feat = ingredient_to_embedding(ing_lower).reshape(1, -1)
            X = hstack([tfidf_feat, ft_feat])

            # --- MODEL PREDICTIONS ---
            allergen_detected = {}
            for i, allergen in enumerate(allergen_mlb.classes_):
                if hasattr(allergen_model.estimators_[i], "predict_proba"):
                    prob = allergen_model.estimators_[i].predict_proba(X)[0, 1]
                    detected = prob >= 0.5
                else:
                    detected = bool(allergen_model.estimators_[i].predict(X)[0])
                    prob = 1.0 if detected else 0.0
                allergen_detected[allergen] = {'predicted': detected, 'confidence': prob}

            # --- CONFIDENCE + KEYWORD LOGIC ---
            final_allergens = set()
            for allergen, info in allergen_detected.items():
                if info['predicted'] and info['confidence'] >= CONFIDENCE_THRESHOLD:
                    final_allergens.add(allergen)
                elif allergen in HIGH_RISK_ALLERGENS:
                    for kw in safety_keywords.get(allergen, []):
                        if kw in ing_lower:
                            final_allergens.add(allergen)

            # --- FUZZY CORRECTION ---
            corrected_allergens = set()
            for a in final_allergens:
                matches = get_close_matches(a, HIGH_RISK_ALLERGENS, n=1, cutoff=FUZZY_CUTOFF)
                corrected_allergens.update(matches if matches else [a])

            # --- LOGICAL FILTER (remove impossible matches) ---
            filtered_allergens = [
                a for a in corrected_allergens if not is_invalid_combo(ing_lower, a)
            ]

            results[ing] = filtered_allergens

        except Exception as e:
            logger.error(f"Error processing ingredient '{ing}': {e}")
            results[ing] = ["Unknown"]

    return results
