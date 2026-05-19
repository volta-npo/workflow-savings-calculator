from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from .engine import PRODUCT_SLUG, PRODUCT_TITLE, build_release_packet

class Handler(BaseHTTPRequestHandler):
    server_version = "VoltaPythonBackend/1.0"

    def _send(self, status: int, payload: dict):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/", "/health"):
            self._send(200, {"ok": True, "product": PRODUCT_SLUG, "title": PRODUCT_TITLE})
        else:
            self._send(404, {"ok": False, "error": "not_found"})

    def do_POST(self):
        if self.path != "/score":
            self._send(404, {"ok": False, "error": "not_found"})
            return
        length = int(self.headers.get("content-length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            self._send(200, build_release_packet(payload))
        except Exception as exc:
            self._send(400, {"ok": False, "error": str(exc)})

    def log_message(self, fmt, *args):
        if os.getenv("VOLTA_LOG_LEVEL", "info") != "silent":
            super().log_message(fmt, *args)

def main() -> int:
    host = os.getenv("VOLTA_BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("VOLTA_BACKEND_PORT", "8787"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"{PRODUCT_TITLE} backend listening on http://{host}:{port}")
    server.serve_forever()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
