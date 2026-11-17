#!/usr/bin/env python3
"""Servidor local para la visualización y su sincronización en tiempo real."""

import ipaddress
import json
import re
import socket
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit


HOST = "0.0.0.0"
PORT = 8000
ROOM_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,32}$")
salas = {}
salas_lock = threading.Lock()


def ip_local():
    """Obtiene la dirección IPv4 que otros equipos de la red pueden alcanzar."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("192.0.2.1", 80))
        ip = sock.getsockname()[0]
        if ipaddress.ip_address(ip).is_private:
            return ip
    except OSError:
        pass
    finally:
        sock.close()
    return "127.0.0.1"


class Manejador(SimpleHTTPRequestHandler):
    def responder_json(self, status, contenido):
        body = json.dumps(contenido).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def room_desde_url(self):
        room = parse_qs(urlsplit(self.path).query).get("room", ["sala"])[0]
        if not ROOM_PATTERN.fullmatch(room):
            raise ValueError("Identificador de sala inválido.")
        return room

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/info":
            self.responder_json(200, {"ip": ip_local(), "port": PORT})
            return
        if path == "/api/state":
            try:
                room = self.room_desde_url()
            except ValueError as error:
                self.responder_json(400, {"error": str(error)})
                return
            with salas_lock:
                state = salas.get(room, {"revision": 0, "selection": None})
            self.responder_json(200, state)
            return
        super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != "/api/state":
            self.responder_json(404, {"error": "Ruta no encontrada."})
            return

        try:
            room = self.room_desde_url()
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 8192:
                raise ValueError("Tamaño de solicitud inválido.")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError("El contenido debe ser un objeto JSON.")
            selection = payload.get("selection")
            if selection is not None:
                if not isinstance(selection, dict):
                    raise ValueError("Selección inválida.")
                kind = selection.get("type")
                if not isinstance(kind, str) or kind not in {"area", "career", "region"}:
                    raise ValueError("Selección inválida.")
                fields = {
                    "area": ("area",),
                    "career": ("area", "career"),
                    "region": ("region",),
                }[kind]
                if any(not isinstance(selection.get(field), str) or not selection[field] for field in fields):
                    raise ValueError("Faltan datos de la selección.")
        except (ValueError, json.JSONDecodeError) as error:
            self.responder_json(400, {"error": str(error)})
            return

        with salas_lock:
            current = salas.get(room, {"revision": 0})
            state = {"revision": current["revision"] + 1, "selection": selection}
            salas[room] = state
        self.responder_json(200, state)


if __name__ == "__main__":
    print(f"Visualización disponible en http://localhost:{PORT}/pagina/")
    print(f"Para otros dispositivos de la red: http://{ip_local()}:{PORT}/pagina/")
    print("Mantén esta terminal abierta mientras uses la visualización. Ctrl+C para detener.")
    ThreadingHTTPServer((HOST, PORT), Manejador).serve_forever()
