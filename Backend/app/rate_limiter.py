# app/rate_limiter.py

import time
from typing import Dict, List
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import asyncio

class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 120):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()
    
    async def is_allowed(self, client_id: str) -> tuple[bool, float]:
        async with self._lock:
            now = time.time()
            if client_id not in self._requests:
                self._requests[client_id] = []
            self._requests[client_id] = [
                ts for ts in self._requests[client_id]
                if now - ts < self.window_seconds
            ]
            if len(self._requests[client_id]) >= self.max_requests:
                oldest_request = self._requests[client_id][0]
                wait_time = self.window_seconds - (now - oldest_request)
                return False, max(0, wait_time)
            self._requests[client_id].append(now)
            return True, 0.0
    
    async def cleanup_old_entries(self):
        async with self._lock:
            now = time.time()
            self._requests = {
                client_id: timestamps
                for client_id, timestamps in self._requests.items()
                if timestamps and (now - timestamps[-1]) < self.window_seconds * 2
            }

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limiter: RateLimiter, protected_paths: List[str] = None):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.protected_paths = protected_paths or [
            "/substitute",
            "/quick-recipes",
            "/generate-cuisine-recipes",
            "/cuisine-recipes"
        ]
    
    async def dispatch(self, request: Request, call_next):
        if not any(request.url.path.startswith(path) for path in self.protected_paths):
            return await call_next(request)
        client_id = request.client.host if request.client else "unknown"
        is_allowed, wait_time = await self.rate_limiter.is_allowed(client_id)
        if not is_allowed:
            return Response(
                content=f'{{"detail": "Rate limit exceeded. Please wait {wait_time:.1f} seconds.", "retry_after": {wait_time}}}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(int(wait_time) + 1)}
            )
        response = await call_next(request)
        return response

class ConcurrencyLimiter:
    def __init__(self, max_concurrent: int = 5):
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def __aenter__(self):
        await self.semaphore.acquire()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.semaphore.release()

rate_limiter = RateLimiter(max_requests=10, window_seconds=120)
concurrency_limiter = ConcurrencyLimiter(max_concurrent=5)
