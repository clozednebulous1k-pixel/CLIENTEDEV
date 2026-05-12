# -*- coding: utf-8 -*-
"""
Lê uma colagem do Google Maps (com linhas 'Rotas') e gera clientes.tsv
com colunas: empresa | telefone

Uso:
  python parse_clientes.py
  python parse_clientes.py minha_colagem.txt

Por omissão lê colagem.txt na mesma pasta deste script.
"""
import re
import sys
from pathlib import Path


def digits(s):
    return re.sub(r"\D", "", s)


def phones_in(text):
    out = []
    for m in re.finditer(r"\(\d{2}\)\s*[\d\s-]{8,22}", text):
        p = m.group().replace("  ", " ").strip()
        d = digits(p)
        if len(d) in (10, 11) and p not in out:
            out.append(p)
    return out


def title_line(block):
    skip = {
        "resultados",
        "compartilhar",
        "patrocinado",
        "entrega",
        "retirada na loja",
        "retirada na porta",
        "compras na loja",
        "website",
    }
    lines = [ln.strip() for ln in block.splitlines()]
    for t in lines:
        if not t or t.startswith('"'):
            continue
        low = t.lower()
        if low in skip:
            continue
        if re.match(r"^[·\s·]+$", t) or t in ("·", "\ue84b", "\ue4ee", "\ue5d4"):
            continue
        if len(t) <= 4 and not any(ch.isalnum() for ch in t):
            continue
        if re.match(r"^\d+[,.]\d+", t):
            continue
        if low == "nenhuma avaliação":
            continue
        if low.startswith("acesse o site"):
            continue
        if re.match(r"^[\d$·\s]+$", t):
            continue
        return t
    for t in lines:
        if not t or t.startswith('"'):
            continue
        if re.search(
            r"(ltda|ltda\.|me|ep|s/a|comércio|comercio|import)", t, re.I
        ) and "·" not in t[:3]:
            return t
    return "(sem nome)"


def refine_name_for_messy_block(block, phones):
    if len(phones) < 2 and "Cabide" not in block and "Prosec" not in block:
        return None
    if "Prosec Comércio" in block and "(11) 5565-0654" in block:
        return "Prosec Comércio e Serviços de Sistemas Eletrônicos"
    return None


def parse_raw(raw: str):
    parts = re.split(r"\r?\n[^\r\n]*Rotas[^\r\n]*\r?\n", raw, flags=re.I)
    rows = []
    for p in parts:
        b = p.strip()
        if len(b) < 5:
            continue
        ph = phones_in(b)
        name = refine_name_for_messy_block(b, ph) or title_line(b)
        if name in ("·", "\ue4ee", "\ue84b") or (len(name) < 2 and ph):
            name = title_line(b.replace("\n·\n", "\n"))
        rows.append((name, "; ".join(ph) if ph else "—"))
    return rows


def main():
    base = Path(__file__).resolve().parent
    in_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else base / "colagem.txt"
    out_path = base / "clientes.tsv"

    if not in_path.is_file():
        print(f"Ficheiro não encontrado: {in_path}", file=sys.stderr)
        print("Uso: python parse_clientes.py [colagem.txt]", file=sys.stderr)
        sys.exit(1)

    raw = in_path.read_text(encoding="utf-8")
    rows = parse_raw(raw)

    out_path.write_text(
        "empresa\ttelefone\n" + "\n".join(f"{n}\t{p}" for n, p in rows) + "\n",
        encoding="utf-8",
    )

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("empresa\ttelefone")
    for n, p in rows:
        print(f"{n}\t{p}")
    print(f"\nGravado: {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
