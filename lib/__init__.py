# lib/__init__.py
# Makes lib a package and exposes key utilities

from .llm import run_llm
from .database import get_connection
from .config import load_config

__all__ = ["run_llm", "get_connection", "load_config"]
