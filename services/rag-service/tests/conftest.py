from pathlib import Path
import sys

# Ensure the service `app` package directory is on sys.path so tests can import `app`
ROOT = Path(__file__).resolve().parents[2]
root_str = str(ROOT)
if root_str not in sys.path:
    sys.path.insert(0, root_str)
