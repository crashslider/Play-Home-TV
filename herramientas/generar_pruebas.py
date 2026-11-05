"""Picks sample streams from the local lists and writes prueba-tv/streams.local.js.

Only names and types are printed: URLs may contain credentials.
"""
import json
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "prueba-tv" / "streams.local.js"
GRUPO_CANALES = "Nacionales"
MAX_POR_TIPO = 2


def leer(nombre):
    entradas, extinf = [], None
    for linea in (RAIZ / nombre).read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea.startswith("#EXTINF"):
            extinf = linea
        elif linea and not linea.startswith("#") and extinf:
            grupo = re.search(r'group-title="([^"]*)"', extinf)
            entradas.append({
                "grupo": grupo.group(1) if grupo else "",
                "nombre": extinf.rsplit(",", 1)[-1].strip(),
                "url": linea,
            })
            extinf = None
    return entradas


def tipo(entrada):
    ruta = entrada["url"].split("?")[0].lower()
    if "/movie/" in ruta or "/series/" in ruta:
        seccion = "Pelicula" if "/movie/" in ruta else "Episodio"
        return f"{seccion} .{ruta.rsplit('.', 1)[-1]}"
    if ruta.endswith(".m3u8"):
        return "Canal HLS"
    return "Canal sin extension"


def main():
    canales = leer("canales.m3u")
    nacionales = [c for c in canales if c["grupo"] == GRUPO_CANALES]
    candidatos = nacionales + [c for c in canales if c["grupo"] != GRUPO_CANALES] + leer("nueva.m3u")

    pruebas, cuenta = [], {}
    for entrada in candidatos:
        clave = tipo(entrada)
        if cuenta.get(clave, 0) < MAX_POR_TIPO:
            cuenta[clave] = cuenta.get(clave, 0) + 1
            pruebas.append({"tipo": clave, "nombre": entrada["nombre"], "url": entrada["url"]})

    pruebas.sort(key=lambda p: p["tipo"])
    SALIDA.write_text("window.PRUEBAS = " + json.dumps(pruebas, ensure_ascii=False) + ";\n", encoding="utf-8")
    for prueba in pruebas:
        print(f"{prueba['tipo']:22} {prueba['nombre']}")


if __name__ == "__main__":
    main()
