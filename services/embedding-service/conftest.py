import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault("LEXCAM_TEST_NO_MODEL", "1")
