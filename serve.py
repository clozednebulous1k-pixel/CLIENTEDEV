#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serve sempre a pasta onde está este ficheiro (com index.html),
mesmo que cries o terminal doutro diretório — evita 404.
"""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import webbrowser
from pathlib import Path
from threading import Timer

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "index.html"
PORT = int(os.environ.get("PORT", "8080"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args_):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args_))


def main():
    if not INDEX.is_file():
        print("ERRO: nao encontrei index.html em:", ROOT, file=sys.stderr)
        sys.exit(1)

    os.chdir(ROOT)
    url = "http://127.0.0.1:%s/clientes.html" % PORT

    def abrir():
        webbrowser.open(url)

    print("\n  Pasta servida:", ROOT)
    print("  Abre no browser:", url)
    print("  (se nao abrir sozinho, copia o link acima)\n  Ctrl+C para parar\n")
    Timer(1.2, abrir).start()

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except OSError as e:
        if getattr(e, "winerror", None) == 10048 or "address already in use" in str(e).lower():
            print("Porta %s ocupada. Tenta: set PORT=8765 && python serve.py" % PORT, file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
