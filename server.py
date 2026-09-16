"""
Explorer 本地服务器
- 提供静态文件 (http://localhost:8080)
- 提供 /api/save (POST) 自动写入 explorer-data.json
- 提供 /api/load (GET)  读取 explorer-data.json

注意：这个版本不会自动打开浏览器，
      浏览器由 start-explorer.vbs 或你自己手动打开。
"""
import http.server
import socketserver
import json
import pathlib
import sys

PORT = 8080
ROOT = pathlib.Path(__file__).parent.resolve()
DATA_FILE = ROOT / "explorer-data.json"
URL = f"http://localhost:{PORT}"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.address_string(), fmt % args))

    def _send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/save":
            self.send_error(404, "Not Found")
            return
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
            tmp = DATA_FILE.with_suffix(".tmp")
            tmp.write_text(
                json.dumps(data, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
            tmp.replace(DATA_FILE)
            self._send_json({"ok": True})
        except Exception as e:
            self._send_json({"ok": False, "error": str(e)}, status=500)

    def do_GET(self):
        if self.path == "/api/load":
            if DATA_FILE.exists():
                try:
                    content = DATA_FILE.read_text(encoding="utf-8")
                    body = content.encode("utf-8")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                except Exception as e:
                    self._send_json({"ok": False, "error": str(e)}, status=500)
            else:
                self.send_error(404, "No backup file yet")
            return
        super().do_GET()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


def main():
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print("=" * 56)
        print(f"  Explorer running at  {URL}")
        print(f"  Backup file will be  {DATA_FILE}")
        print("  Press Ctrl+C to stop.")
        print("=" * 56)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()