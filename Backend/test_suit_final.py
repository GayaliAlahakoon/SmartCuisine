# Unified Automated Testing Script for SmartCuisine Backend
# Tests both API and LLM endpoints and logs results

import time
import json
import requests
from pathlib import Path
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 180  # seconds

# Ingredients for tests
TEST_INGREDIENTS_API = [
    "sugar", "pistachio nuts", "white almond bark", "flour",
    "vanilla extract", "olive oil", "almond extract", "eggs",
    "baking powder", "dried cranberries"
]

TEST_INGREDIENTS_LLM_QUICK = ["chicken", "soy sauce", "ginger", "rice", "garlic"]
TEST_INGREDIENTS_LLM_CUISINE = ["tofu", "broccoli", "rice", "sesame oil", "ginger"]

# Result directories
RESULTS_DIR = Path("test_results")
API_RESULTS_DIR = RESULTS_DIR / "api"
LLM_RESULTS_DIR = RESULTS_DIR / "llm"
API_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
LLM_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

def print_section(title):
    print("\n" + "-" * 70)
    print(title)
    print("-" * 70)

def log_result(name, data, folder):
    path = folder / f"{name}.json"
    timestamp = datetime.now().isoformat()
    entry = {"timestamp": timestamp, "result": data}

    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception:
            existing_data = []
    else:
        existing_data = []

    if not isinstance(existing_data, list):
        existing_data = [existing_data]

    existing_data.append(entry)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=2)

    print(f"Saved log with timestamp: {path}")

def test_endpoint(name, method, endpoint, payload=None, folder=RESULTS_DIR):
    url = f"{BASE_URL}{endpoint}"
    print_section(f"Testing Endpoint: {name} ({endpoint})")
    start = time.time()
    try:
        if method.lower() == "post":
            res = requests.post(url, json=payload, timeout=TIMEOUT)
        else:
            res = requests.get(url, timeout=TIMEOUT)
        elapsed = time.time() - start

        try:
            data = res.json()
        except Exception:
            print(f"Non-JSON response: {res.text[:300]}")
            data = {"raw_response": res.text}

        status = res.status_code
        print(f"Status: {status} | Time: {elapsed:.2f}s")
        if status == 200:
            print(f"Success: {name} executed successfully.")
        else:
            print(f"Error: {name} failed with status {status}.")
        log_result(name.replace(' ', '_'), data, folder)
        return data

    except requests.exceptions.RequestException as e:
        print(f"Request error during {name}: {e}")
        log_result(name.replace(' ', '_'), {"error": str(e)}, folder)
        return None

def run_api_tests():
    print_section("Starting SmartCuisine API Tests")
    results = {}

    payload = {"ingredients": TEST_INGREDIENTS_API}
    predict_data = test_endpoint("Predict Cuisine", "post", "/predict-cuisine", payload, API_RESULTS_DIR)
    results["predict_cuisine"] = predict_data

    top_cuisine = predict_data["predictions"][0][0] if predict_data and "predictions" in predict_data else None
    if top_cuisine:
        print(f"Predicted top cuisine: {top_cuisine}")

    quick_data = test_endpoint("Quick Recipes", "post", "/quick-recipes", payload, API_RESULTS_DIR)
    results["quick_recipes"] = quick_data

    if top_cuisine:
        cuisine_payload = {"ingredients": TEST_INGREDIENTS_API, "cuisine_type": top_cuisine, "num_recipes": 5}
        cuisine_rec_data = test_endpoint("Cuisine Recipes", "post", "/generate-cuisine-recipes", cuisine_payload, API_RESULTS_DIR)
        results["cuisine_recipes"] = cuisine_rec_data
    else:
        results["cuisine_recipes"] = None

    sub_payload = {"ingredient": "eggs", "recipe_name": "Almond Cake", "reason": "allergen detected"}
    sub_data = test_endpoint("Substitute Suggestion", "post", "/substitute", sub_payload, API_RESULTS_DIR)
    results["substitute"] = sub_data

    return results

def run_llm_tests():
    print_section("Starting SmartCuisine LLM Tests")
    results = {}

    quick_payload = {"ingredients": TEST_INGREDIENTS_LLM_QUICK}
    quick_data = test_endpoint("Quick Recipes (LLM)", "post", "/quick-recipes", quick_payload, LLM_RESULTS_DIR)
    results["quick_recipes"] = quick_data

    cuisine_payload = {"ingredients": TEST_INGREDIENTS_LLM_QUICK}
    predict_data = test_endpoint("Predict Cuisine (LLM)", "post", "/predict-cuisine", cuisine_payload, LLM_RESULTS_DIR)
    results["predict_cuisine"] = predict_data

    top_cuisine = predict_data["predictions"][0][0] if predict_data and "predictions" in predict_data else None

    if top_cuisine:
        cuisine_payload_llm = {"ingredients": TEST_INGREDIENTS_LLM_CUISINE, "cuisine_type": top_cuisine, "num_recipes": 5}
        cuisine_rec_data = test_endpoint("Cuisine Recipes (LLM)", "post", "/cuisine-recipes", cuisine_payload_llm, LLM_RESULTS_DIR)
        results["cuisine_recipes"] = cuisine_rec_data
    else:
        results["cuisine_recipes"] = None

    return results

def run_all_tests():
    total_start = time.time()
    print_section("SmartCuisine Unified Automated Test Suite")

    api_results = run_api_tests()
    llm_results = run_llm_tests()

    summary = {"api": api_results, "llm": llm_results}
    summary_file = RESULTS_DIR / "summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print_section("Unified Test Summary")
    for category, res in summary.items():
        print(f"\n[{category.upper()}]")
        for name, data in res.items():
            status = "PASSED ✅" if data else "FAILED ❌"
            print(f"{name:25} : {status}")

    print(f"\nAll test results saved under: {RESULTS_DIR.resolve()}")
    print(f"Total runtime: {round(time.time() - total_start, 2)}s")
    print("\n==== Test Suite Completed ====\n")

if __name__ == "__main__":
    run_all_tests()
