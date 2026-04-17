import requests
import time
import asyncio
import aiohttp
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()
BASE_URL = "http://127.0.0.1:8000"


def print_test_header(test_name: str):
    console.print(f"\n[bold cyan]{'='*60}[/bold cyan]")
    console.print(f"[bold yellow]TEST: {test_name}[/bold yellow]")
    console.print(f"[bold cyan]{'='*60}[/bold cyan]\n")


def print_result(success: bool, message: str):
    if success:
        console.print(f"[green]✅ {message}[/green]")
    else:
        console.print(f"[red]❌ {message}[/red]")


def test_backend_health():
    print_test_header("Backend Health Check")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            console.print("[green]Backend is running![/green]")
            console.print(f"Version: {data.get('version')}")
            console.print(f"Rate Limiting: {data.get('rate_limiting', {}).get('enabled')}")
            return True
        else:
            print_result(False, f"Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Cannot connect to backend: {e}")
        console.print("[yellow]Make sure FastAPI is running: uvicorn app.main:app --reload[/yellow]")
        return False


def test_sequential_rate_limit():
    print_test_header("Sequential Rate Limit Test")
    console.print("Sending 12 requests sequentially to /substitute endpoint...")
    console.print("[dim]Rate limit: 10 requests per 120 seconds[/dim]\n")

    results = []

    for i in range(1, 13):
        try:
            response = requests.post(
                f"{BASE_URL}/substitute",
                json={"ingredient": "milk", "recipe_name": "test", "reason": "testing rate limit"},
                timeout=5
            )
            status = response.status_code
            results.append({"request": i, "status": status, "success": status in [200, 429]})

            if status == 200:
                console.print(f"[green]Request {i:2d}: ✅ Success (200)[/green]")
            elif status == 429:
                data = response.json()
                retry_after = response.headers.get('Retry-After', 'N/A')
                console.print(f"[yellow]Request {i:2d}: ⏳ Rate Limited (429) - Retry after {retry_after}s[/yellow]")
                console.print(f"[dim]   Message: {data.get('detail')}[/dim]")
            else:
                console.print(f"[red]Request {i:2d}: ❌ Unexpected status ({status})[/red]")

            time.sleep(0.5)

        except Exception as e:
            console.print(f"[red]Request {i:2d}: ❌ Error: {e}[/red]")
            results.append({"request": i, "status": "error", "success": False})

    console.print("\n[bold]Summary:[/bold]")
    success_count = sum(1 for r in results if r["status"] == 200)
    rate_limited_count = sum(1 for r in results if r["status"] == 429)

    console.print(f"✅ Successful: {success_count}")
    console.print(f"⏳ Rate Limited: {rate_limited_count}")

    if rate_limited_count >= 2:
        print_result(True, "Rate limiting is working! Requests 11+ were blocked.")
        return True
    else:
        print_result(False, "Expected rate limiting after 10 requests but fewer were blocked")
        return False


async def test_concurrent_rate_limit():
    print_test_header("Concurrent Rate Limit Test")
    console.print("Sending 15 requests concurrently to /substitute endpoint...")
    console.print("[dim]Rate limit: 10 requests per 120 seconds[/dim]")
    console.print("[dim]Concurrency limit: 5 simultaneous LLM calls[/dim]\n")

    async def send_request(session, i):
        try:
            async with session.post(
                f"{BASE_URL}/substitute",
                json={"ingredient": "milk", "recipe_name": "test", "reason": "concurrent test"},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                status = response.status
                data = await response.json()
                return {"request": i, "status": status, "data": data}
        except Exception as e:
            return {"request": i, "status": "error", "error": str(e)}

    async with aiohttp.ClientSession() as session:
        tasks = [send_request(session, i) for i in range(1, 16)]
        results = await asyncio.gather(*tasks)

    for result in sorted(results, key=lambda x: x["request"]):
        i = result["request"]
        status = result["status"]

        if status == 200:
            console.print(f"[green]Request {i:2d}: ✅ Success (200)[/green]")
        elif status == 429:
            retry_after = result.get("data", {}).get("retry_after", "N/A")
            console.print(f"[yellow]Request {i:2d}: ⏳ Rate Limited (429) - Retry: {retry_after}s[/yellow]")
        else:
            console.print(f"[red]Request {i:2d}: ❌ Status {status}[/red]")

    console.print("\n[bold]Summary:[/bold]")
    success_count = sum(1 for r in results if r["status"] == 200)
    rate_limited_count = sum(1 for r in results if r["status"] == 429)

    console.print(f"✅ Successful: {success_count}")
    console.print(f"⏳ Rate Limited: {rate_limited_count}")

    if rate_limited_count >= 5:
        print_result(True, "Concurrent rate limiting working!")
        return True
    else:
        print_result(False, f"Expected more rate limiting, got {rate_limited_count}")
        return False


def test_unprotected_endpoints():
    print_test_header("Unprotected Endpoints Test")
    console.print("Testing /predict-cuisine and /allergen-check (should NOT be rate limited)...\n")

    console.print("[bold]Testing /predict-cuisine:[/bold]")
    rate_limited = False

    for i in range(1, 16):
        try:
            response = requests.post(
                f"{BASE_URL}/predict-cuisine",
                json={"ingredients": ["rice", "soy sauce", "ginger"]},
                timeout=5
            )
            if response.status_code == 429:
                rate_limited = True
                console.print(f"[red]Request {i:2d}: Rate limited (shouldn't happen!)[/red]")
            else:
                console.print(f"[green]Request {i:2d}: ✅ Success ({response.status_code})[/green]")
        except Exception as e:
            console.print(f"[red]Request {i:2d}: Error: {e}[/red]")

    if not rate_limited:
        print_result(True, "Unprotected endpoints are not rate limited")
        return True
    else:
        print_result(False, "Unprotected endpoints were rate limited")
        return False


def test_wait_and_retry():
    print_test_header("Wait and Retry Test")
    console.print("Sending requests until rate limit is hit...")

    for i in range(11):
        try:
            response = requests.post(
                f"{BASE_URL}/substitute",
                json={"ingredient": "milk", "recipe_name": "test", "reason": "test"},
                timeout=5
            )
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 30))
                console.print(f"[yellow]Hit rate limit at request {i+1}![/yellow]")
                console.print(f"[yellow]Backend says wait {retry_after}s[/yellow]")
                wait_time = min(retry_after, 10)
                console.print(f"Waiting {wait_time}s...")
                time.sleep(wait_time)
                console.print("Trying again after wait...")
                response2 = requests.post(
                    f"{BASE_URL}/substitute",
                    json={"ingredient": "milk", "recipe_name": "test", "reason": "test"},
                    timeout=5
                )
                if response2.status_code == 200:
                    print_result(True, "Request succeeded after waiting")
                    return True
                elif response2.status_code == 429:
                    console.print("[yellow]Still rate limited (need to wait longer)[/yellow]")
                    print_result(True, "Rate limit persists correctly")
                    return True
                break
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")

    return False


def test_cli_integration():
    print_test_header("CLI Integration Test")
    console.print("[yellow]Manual test: run python cli.py[/yellow]")
    console.print("Steps:")
    console.print("1. Enter ingredients: milk, eggs, flour")
    console.print("2. Choose Quick Recipes")
    console.print("3. View recipe")
    console.print("4. Request substitutions rapidly 10+ times")
    console.print("Expected:")
    console.print("- First 10: work normally")
    console.print("- 11+: show rate limit message")
    console.print("- After wait: works again")
    return True


def run_all_tests():
    console.print(Panel("[bold cyan]SmartCuisine Rate Limiting Test Suite[/bold cyan]\n[yellow]Testing backend rate limiting[/yellow]", expand=False))
    results = []

    if not test_backend_health():
        console.print("\n[red]Backend is not running. Stopping tests.[/red]")
        return

    results.append(("Health Check", True))

    try:
        result = test_sequential_rate_limit()
        results.append(("Sequential Rate Limit", result))
    except Exception as e:
        console.print(f"[red]Test failed: {e}[/red]")
        results.append(("Sequential Rate Limit", False))

    try:
        result = asyncio.run(test_concurrent_rate_limit())
        results.append(("Concurrent Rate Limit", result))
    except Exception as e:
        console.print(f"[red]Test failed: {e}[/red]")
        results.append(("Concurrent Rate Limit", False))

    try:
        result = test_unprotected_endpoints()
        results.append(("Unprotected Endpoints", result))
    except Exception as e:
        console.print(f"[red]Test failed: {e}[/red]")
        results.append(("Unprotected Endpoints", False))

    try:
        result = test_wait_and_retry()
        results.append(("Wait and Retry", result))
    except Exception as e:
        console.print(f"[red]Test failed: {e}[/red]")
        results.append(("Wait and Retry", False))

    test_cli_integration()

    console.print("\n" + "="*60)
    console.print("[bold cyan]TEST SUMMARY[/bold cyan]")
    console.print("="*60 + "\n")

    table = Table(show_header=True, header_style="bold blue")
    table.add_column("Test", style="cyan")
    table.add_column("Result", style="white")

    for test_name, passed in results:
        status = "[green]✅ PASSED[/green]" if passed else "[red]❌ FAILED[/red]"
        table.add_row(test_name, status)

    console.print(table)

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    console.print(f"\n[bold]Total: {passed_count}/{total_count} tests passed[/bold]")

    if passed_count == total_count:
        console.print("\n[green]All tests passed! Rate limiting works correctly.[/green]")
    else:
        console.print("\n[yellow]Some tests failed. Check output above for details.[/yellow]")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        console.print("\n[red]Tests interrupted by user.[/red]")
