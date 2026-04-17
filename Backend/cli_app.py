import asyncio
from typing import List, Dict, Any, Optional, Set
import aiohttp
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, IntPrompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn

FASTAPI_BASE = "http://127.0.0.1:8000"
MAX_CONCURRENT = 5

console = Console()
substitution_cache: Dict[str, Dict[str, Any]] = {}

async def post_json(session: aiohttp.ClientSession, path: str, payload: dict, timeout: int = 120, retry_on_429: bool = True):
    url = FASTAPI_BASE.rstrip("/") + path
    max_retries = 3
    retry_count = 0
    while retry_count < max_retries:
        try:
            timeout_obj = aiohttp.ClientTimeout(total=timeout)
            async with session.post(url, json=payload, timeout=timeout_obj) as resp:
                if resp.status == 429 and retry_on_429:
                    retry_after = int(resp.headers.get('Retry-After', 30))
                    console.print(f"[yellow]⏳ Rate limit reached. Backend asks to wait {retry_after}s...[/yellow]")
                    await asyncio.sleep(retry_after)
                    retry_count += 1
                    continue
                resp.raise_for_status()
                return await resp.json()
        except aiohttp.ClientError as e:
            if retry_count < max_retries - 1:
                console.print(f"[yellow]Request failed, retrying... ({retry_count + 1}/{max_retries})[/yellow]")
                retry_count += 1
                await asyncio.sleep(2)
            else:
                console.print(f"[red]HTTP Error: {e}[/red]")
                raise
        except asyncio.TimeoutError:
            console.print(f"[red]Request timeout after {timeout}s[/red]")
            raise
        except Exception as e:
            console.print(f"[red]Unexpected error: {e}[/red]")
            raise
    raise Exception(f"Failed after {max_retries} retries")

async def api_predict_cuisine(session: aiohttp.ClientSession, ingredients: List[str]) -> List:
    res = await post_json(session, "/predict-cuisine", {"ingredients": ingredients})
    return res.get("predictions", [])

async def api_quick_recipes(session: aiohttp.ClientSession, ingredients: List[str], num_recipes: int = 5) -> List[Dict]:
    res = await post_json(session, "/quick-recipes", {"ingredients": ingredients})
    if isinstance(res, list):
        return res
    elif isinstance(res, dict):
        return res.get("recipes", [])
    return []

async def api_generate_cuisine_recipes(session: aiohttp.ClientSession, ingredients: List[str], cuisine_type: str, num_recipes: int = 5) -> List[Dict]:
    res = await post_json(session, "/generate-cuisine-recipes", {
        "ingredients": ingredients,
        "cuisine_type": cuisine_type,
        "num_recipes": num_recipes
    })
    if isinstance(res, list):
        return res
    elif isinstance(res, dict):
        recipes = res.get("recipes") or res.get("data")
        if recipes is None:
            console.print(f"[yellow]Warning: Unexpected response format[/yellow]")
            return []
        return recipes if isinstance(recipes, list) else []
    return []

async def api_allergen_check(session: aiohttp.ClientSession, ingredients: List[str], retries: int = 2) -> Dict[str, List[str]]:
    for attempt in range(retries):
        try:
            res = await post_json(session, "/allergen-check", {"ingredients": ingredients}, timeout=90, retry_on_429=False)
            return res.get("allergen_details", res.get("allergens", res))
        except Exception as e:
            if attempt < retries - 1:
                console.print(f"[yellow]Allergen check attempt {attempt + 1} failed, retrying...[/yellow]")
                await asyncio.sleep(1)
            else:
                console.print(f"[red]Allergen check failed after {retries} attempts: {e}[/red]")
                raise

async def api_substitute(session: aiohttp.ClientSession, ingredient: str, recipe_name: str, reason: str = "allergen detected") -> Dict[str, Any]:
    res = await post_json(session, "/substitute", {
        "ingredient": ingredient,
        "recipe_name": recipe_name,
        "reason": reason
    }, timeout=120, retry_on_429=True)
    return res

def print_header():
    console.print(Panel(
        "[bold cyan]SmartCuisine CLI[/bold cyan]\n"
        "[yellow]Fast, async, and interactive[/yellow]\n"
        "[dim]Rate limiting handled by backend[/dim]",
        expand=False
    ))

def format_ingredient(ing: str, allergens: Optional[List[str]]):
    if not allergens:
        return f"[green]{ing}[/green]"
    return f"[red]{ing} ⚠️ Contains: {', '.join(allergens)}[/red]"

def show_recipe_summary(recipes: List[Dict]):
    table = Table(show_header=True, header_style="bold blue")
    table.add_column("#", width=3)
    table.add_column("Recipe")
    table.add_column("Time", width=8)
    table.add_column("Difficulty", width=10)
    for i, r in enumerate(recipes, 1):
        table.add_row(
            str(i),
            r.get("name", r.get("title", "Recipe")),
            str(r.get("cooking_time", "N/A")),
            r.get("difficulty", "N/A")
        )
    console.print(table)

def show_full_recipe(recipe: Dict, allergen_map: Dict[str, List[str]]):
    title = recipe.get("name", recipe.get("title", "Recipe"))
    console.print(Panel(
        f"[bold cyan]{title}[/bold cyan]  —  [magenta]{recipe.get('difficulty','N/A')}[/magenta]",
        expand=False
    ))
    console.print(f"[bold]⏱️  Cooking time:[/bold] {recipe.get('cooking_time','N/A')}\n")
    console.print("[bold]🛒 Ingredients:[/bold]")
    for ing in recipe.get("ingredients", []):
        tags = allergen_map.get(ing, [])
        console.print(" • " + format_ingredient(ing, tags))
    console.print("\n[bold]👨‍🍳 Steps:[/bold]")
    for idx, step in enumerate(recipe.get("steps", []), 1):
        console.print(f"[yellow]{idx}.[/yellow] {step}")

async def generate_substitutions_for_recipe(session: aiohttp.ClientSession, recipe: Dict, allergen_map: Dict[str, List[str]], semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    results: Dict[str, Any] = {}
    allergenic_ings = [ing for ing, tags in allergen_map.items() if tags]
    if not allergenic_ings:
        return results
    async def _handle_one(ing: str):
        ing_key = ing.lower()
        if ing_key in substitution_cache:
            return ing, substitution_cache[ing_key]
        async with semaphore:
            try:
                response = await api_substitute(session, ing, recipe.get("name", recipe.get("title", "")))
                substitution_cache[ing_key] = response
                return ing, response
            except Exception as e:
                return ing, {"error": str(e)}
    tasks = [_handle_one(ing) for ing in allergenic_ings]
    for coro in asyncio.as_completed(tasks):
        ing, res = await coro
        results[ing] = res
    return results

async def run_cli():
    print_header()
    connector = aiohttp.TCPConnector(limit=10, limit_per_host=10, ttl_dns_cache=300)
    timeout = aiohttp.ClientTimeout(total=120, connect=30, sock_read=90)
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        while True:
            user_input = Prompt.ask("\nEnter ingredients (comma-separated) or 'exit' to quit").strip()
            if not user_input:
                console.print("[yellow]Please provide some ingredients.[/yellow]")
                continue
            if user_input.lower() in ("exit", "quit"):
                console.print("[green]Goodbye![/green]")
                break
            ingredients = [i.strip() for i in user_input.split(",") if i.strip()]
            console.print("\nChoose path:\n1) Quick Recipes\n2) Analyze Cuisine + Recipes")
            path_choice = Prompt.ask("Enter 1 or 2", choices=["1", "2"], default="1")
            recipes: List[Dict] = []
            if path_choice == "1":
                with console.status("[bold cyan]Generating quick recipes...[/bold cyan]", spinner="dots"):
                    try:
                        recipes = await api_quick_recipes(session, ingredients, num_recipes=5)
                    except Exception as e:
                        console.print(f"[red]Failed to generate recipes: {e}[/red]")
                        continue
            else:
                with console.status("[bold cyan]Predicting cuisine...[/bold cyan]", spinner="dots"):
                    try:
                        preds = await api_predict_cuisine(session, ingredients)
                    except Exception as e:
                        console.print(f"[red]Cuisine prediction failed: {e}[/red]")
                        continue
                if not preds:
                    console.print("[yellow]No cuisine predictions returned — defaulting to Quick Recipes.[/yellow]")
                    with console.status("[bold cyan]Generating quick recipes...[/bold cyan]", spinner="dots"):
                        recipes = await api_quick_recipes(session, ingredients, num_recipes=5)
                else:
                    console.print("\n[magenta]Predicted cuisines (top):[/magenta]")
                    for idx, item in enumerate(preds[:3], 1):
                        if isinstance(item, (list, tuple)) and len(item) >= 2:
                            c_name, prob = item[0], item[1]
                        elif isinstance(item, dict):
                            c_name, prob = item.get("cuisine"), item.get("probability")
                        else:
                            c_name, prob = str(item), 0
                        console.print(f"{idx}) [bold]{c_name}[/bold] — {prob}%")
                    sel = IntPrompt.ask("Select cuisine number (1-3, default 1)", choices=["1", "2", "3"], default=1)
                    choice_idx = max(1, min(3, int(sel))) - 1
                    selected_cuisine = preds[choice_idx][0] if isinstance(preds[choice_idx], (list, tuple)) else preds[choice_idx].get("cuisine", str(preds[choice_idx]))
                    with console.status(f"[bold cyan]Generating {selected_cuisine} recipes...[/bold cyan]", spinner="dots"):
                        try:
                            recipes = await api_generate_cuisine_recipes(session, ingredients, selected_cuisine, num_recipes=5)
                        except Exception as e:
                            console.print(f"[red]Failed to generate cuisine recipes: {e}[/red]")
                            continue
            if not recipes:
                console.print("[yellow]No recipes returned. Try different ingredients.[/yellow]")
                continue
            console.print(f"\n[dim]Received {len(recipes)} recipes[/dim]")
            show_recipe_summary(recipes)
            choice = Prompt.ask("\nSelect recipe number to view or 'all' to view all", default="1")
            if choice.lower() == "all":
                selected_recipes = recipes
            else:
                try:
                    idx = int(choice) - 1
                    selected_recipes = [recipes[idx]]
                except Exception:
                    console.print("[yellow]Invalid selection, showing all.[/yellow]")
                    selected_recipes = recipes
            recipe_allergen_maps: List[Dict[str, List[str]]] = []
            with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), TimeElapsedColumn(), transient=True) as prog:
                task = prog.add_task("[cyan]Checking allergens...", total=len(selected_recipes))
                for rec in selected_recipes:
                    try:
                        ingr_list = rec.get("ingredients", [])
                        allerg_map = await api_allergen_check(session, ingr_list)
                        recipe_allergen_maps.append(allerg_map)
                    except Exception as e:
                        console.print(f"[red]Allergen check failed for recipe '{rec.get('name', rec.get('title',''))}': {e}[/red]")
                        recipe_allergen_maps.append({})
                    prog.advance(task)
            for rec, allerg_map in zip(selected_recipes, recipe_allergen_maps):
                show_full_recipe(rec, allerg_map)
            any_allergens = any(allergen_map and any(v for v in allergen_map.values()) for allergen_map in recipe_allergen_maps)
            if not any_allergens:
                console.print("\n[green]✅ No allergens detected in selected recipes.[/green]")
                continue
            want_subs = Confirm.ask("\n⚠️ Allergens detected. Would you like substitution suggestions?", default=False)
            if not want_subs:
                console.print("[cyan]Skipping substitutions as requested.[/cyan]")
                continue
            semaphore = asyncio.Semaphore(MAX_CONCURRENT)
            console.print("\n[bold]✨ Generating substitution suggestions...[/bold]")
            console.print("[dim]Backend will handle rate limiting if needed[/dim]")
            tasks = [generate_substitutions_for_recipe(session, rec, allerg_map, semaphore) for rec, allerg_map in zip(selected_recipes, recipe_allergen_maps)]
            with Progress(SpinnerColumn(), TextColumn("[green]{task.description}")) as progress:
                task_id = progress.add_task("[green]Requesting substitutions...[/green]", total=None)
                subs_results = await asyncio.gather(*tasks, return_exceptions=True)
                progress.update(task_id, visible=False)
            for rec, subs_map in zip(selected_recipes, subs_results):
                rec_name = rec.get("name", rec.get("title", "Recipe"))
                console.print(Panel(f"[bold blue]Substitutions for:[/bold blue] {rec_name}", expand=False))
                if isinstance(subs_map, Exception):
                    console.print(f"[red]Error generating substitutions: {subs_map}[/red]")
                    continue
                if not subs_map:
                    console.print("[green]No allergen substitutions required.[/green]")
                    continue
                for ing, sub in subs_map.items():
                    if isinstance(sub, dict):
                        substitute = sub.get("substitute") or sub.get("substitution") or sub.get("text") or str(sub)
                        notes = sub.get("notes") or sub.get("note") or ""
                        console.print(f"[yellow]• {ing} →[/yellow] [cyan]{substitute}[/cyan]")
                        if notes:
                            console.print(f"   [dim]{notes}[/dim]")
                    else:
                        console.print(f"[yellow]• {ing} →[/yellow] [cyan]{sub}[/cyan]")
            console.print("\n[green]✅ Substitution suggestions complete.[/green]")

def main():
    try:
        asyncio.run(run_cli())
    except KeyboardInterrupt:
        console.print("\n[red]Interrupted by user. Goodbye.[/red]")

if __name__ == "__main__":
    main()
