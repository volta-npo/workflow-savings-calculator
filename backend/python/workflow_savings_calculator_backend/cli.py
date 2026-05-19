from __future__ import annotations

import json
import sys
from .engine import build_release_packet

def main() -> int:
    payload = json.load(sys.stdin) if not sys.stdin.isatty() else {"rows": []}
    print(json.dumps(build_release_packet(payload), indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
