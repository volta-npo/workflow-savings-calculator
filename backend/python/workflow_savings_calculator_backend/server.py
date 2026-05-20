from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from .engine import PRODUCT_SLUG, PRODUCT_TITLE, build_release_packet

MAX_REQUEST_BYTES = 64_000
DEFAULT_ALLOWED_ORIGINS = "http://localhost:8080,http://127.0.0.1:8080"

class Handler(BaseHTTPRequestHandler):
    server_version = "VoltaPythonBackend/1.1"

    def _allowed_origin(self) -> str:
        origin = self.headers.get("Origin", "")
        allowed = {item.strip() for item in os.getenv("VOLTA_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",") if item.strip()}
        return origin if origin in allowed else "null"

    def _send(self, status: int, payload: dict):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", self._allowed_origin())
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, {})

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
        if length > MAX_REQUEST_BYTES:
            self._send(413, {"ok": False, "error": "request_too_large", "limit": MAX_REQUEST_BYTES})
            return
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            packet = build_release_packet(payload)
            status = 400 if packet["score"]["warnings"] and any("workflow." in warning or "owner_approval" in warning or "rows limit" in warning for warning in packet["score"]["warnings"]) else 200
            self._send(status, packet)
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
