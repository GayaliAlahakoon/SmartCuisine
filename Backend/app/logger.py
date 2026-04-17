# app/logger.py

#This class provides a readable logging system for the API.
import logging
import time
from typing import List, Dict, Optional
from datetime import datetime

class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Bright colors
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'

class SmartCuisineLogger:
    
    SEPARATOR = "─" * 80
    
    @staticmethod
    def _get_timestamp():
        """Get formatted timestamp"""
        return datetime.now().strftime("%H:%M:%S")
    
    @staticmethod
    def _format_log(level: str, message: str, color: str = Colors.WHITE):
        """Format a log message with timestamp and color"""
        timestamp = SmartCuisineLogger._get_timestamp()
        level_colored = f"{color}{level:8}{Colors.RESET}"
        return f"{Colors.DIM}{timestamp}{Colors.RESET} | {level_colored} | {message}"
    
    @classmethod
    def header(cls, path: str, ingredients: List[str]):
        """Print request header"""
        print(f"\n{Colors.CYAN}{cls.SEPARATOR}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BRIGHT_CYAN}🍽️  New Request — Path: {path}{Colors.RESET}")
        print(f"{Colors.DIM}Ingredients: {', '.join(ingredients)}{Colors.RESET}")
        print(f"{Colors.CYAN}{cls.SEPARATOR}{Colors.RESET}")
    
    @classmethod
    def footer(cls, duration: float):
        """Print completion footer"""
        print(f"{Colors.CYAN}{cls.SEPARATOR}{Colors.RESET}")
        print(f"{Colors.BRIGHT_GREEN}✅ Completed in {duration:.1f}s{Colors.RESET}")
        print(f"{Colors.CYAN}{cls.SEPARATOR}{Colors.RESET}\n")
    
    @classmethod
    def info(cls, message: str):
        """Log info message"""
        print(cls._format_log("INFO", message, Colors.BLUE))
    
    @classmethod
    def success(cls, message: str):
        """Log success message"""
        print(cls._format_log("SUCCESS", message, Colors.BRIGHT_GREEN))
    
    @classmethod
    def warning(cls, message: str):
        """Log warning message"""
        print(cls._format_log("WARNING", message, Colors.BRIGHT_YELLOW))
    
    @classmethod
    def error(cls, message: str):
        """Log error message"""
        print(cls._format_log("ERROR", message, Colors.BRIGHT_RED))
    
    @classmethod
    def llm(cls, message: str):
        """Log LLM-related message"""
        print(cls._format_log("LLM", message, Colors.MAGENTA))
    
    @classmethod
    def ml(cls, message: str):
        """Log ML model message"""
        print(cls._format_log("ML", message, Colors.CYAN))
    
    @classmethod
    def cuisine_prediction(cls, predictions: List[tuple]):
        """Log cuisine predictions"""
        pred_str = ", ".join([f"{name} ({score:.2f}%)" for name, score in predictions])
        cls.ml(f"predict_cuisine: {pred_str}")
    
    @classmethod
    def recipe_generated(cls, count: int, cuisine_type: Optional[str] = None):
        """Log recipe generation"""
        cuisine_text = f"{cuisine_type} " if cuisine_type else ""
        cls.success(f"LLM: Generated {count} {cuisine_text}recipes")
    
    @classmethod
    def allergen_check_start(cls, recipe_num: int, recipe_name: str):
        """Log allergen check start"""
        cls.info(f"allergen_check: Running on recipe #{recipe_num} — {recipe_name}")
    
    @classmethod
    def allergen_detected(cls, allergens: List[str]):
        """Log detected allergens"""
        if allergens:
            allergen_str = ", ".join(allergens)
            cls.warning(f"Allergen: {allergen_str}")
        else:
            cls.success("No allergens detected")
    
    @classmethod
    def substitution_suggested(cls, original: str, substitute: str):
        """Log substitution suggestion"""
        cls.success(f"LLM: Generated substitution → {substitute} for {original}")
    
    @classmethod
    def divider(cls):
        """Print a simple divider"""
        print(f"{Colors.DIM}{'─' * 40}{Colors.RESET}")


class RequestTimer:
    """Context manager for timing requests"""
    
    def __init__(self):
        self.start_time = None
        self.duration = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.duration = time.time() - self.start_time
    
    def elapsed(self):
        """Get elapsed time"""
        if self.start_time:
            return time.time() - self.start_time
        return 0

logger = SmartCuisineLogger()