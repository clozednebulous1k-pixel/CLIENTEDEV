# -*- coding: utf-8 -*-
"""
Lê uma colagem do Google Maps (com linhas 'Rotas') e gera:
  - clientes.tsv — linhas que não são estética automotiva nem arquitetura (pelo nome + tipo Maps)
  - clientes-estetica.tsv — só estética automotiva
  - clientes-arquitetura.tsv — só arquitetura / design de interiores / paisagismo (critério alinhado ao JS)

Colunas: empresa | telefone | tipo (categoria do Maps, quando detectada)

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


ESTETICA_RE = re.compile(
    r"est[ée]tica automotiva|"
    r"centro de est[ée]tica|"
    r"detailing|detalhamento automot|"
    r"vitrifica|"
    r"polimento automot|polimento de car|polimento de ve[íi]cul|"
    r"cer[âa]mica automot|"
    r"nano[- ]?ceramic|coating|"
    r"\bppf\b|paint protection|"
    r"envelopamento|"
    r"auto spa|car care|"
    r"est[ée]tica auto\b|"
    r"funilaria est[ée]t|"
    r"higieniza.*(carro|ve[íi]cul|interior)|"
    r"lavagem.*(premium|detalh)|"
    r"lava[- ]?jato.*(carro|ve[íi]cul|auto)",
    re.I,
)

ARQUITETURA_RE = re.compile(
    r"arquitet|arquiteto|arquiteta|"
    r"escritório de arquitet|escritorio de arquitet|"
    r"estúdio de arquitet|estudio de arquitet|"
    r"urbanismo\b|paisagismo|projeto arquitet|"
    r"design de interiores|decorador de interiores",
    re.I,
)


def is_estetica_row(empresa: str, tipo_maps: str) -> bool:
    blob = f"{empresa or ''} {tipo_maps or ''}".lower()
    return bool(ESTETICA_RE.search(blob))


def is_arquitetura_row(empresa: str, tipo_maps: str) -> bool:
    blob = f"{empresa or ''} {tipo_maps or ''}".lower()
    return bool(ARQUITETURA_RE.search(blob))


def row_bucket(empresa: str, tipo_maps: str) -> str:
    if is_estetica_row(empresa, tipo_maps):
        return "e"
    if is_arquitetura_row(empresa, tipo_maps):
        return "a"
    return "o"


def extract_tipo_maps(block: str) -> str:
    lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
    for i, ln in enumerate(lines):
        if re.match(r"^(Nenhuma avaliação|\d+[,.]\d+)", ln):
            if i + 1 >= len(lines):
                return ""
            nxt = lines[i + 1]
            sep = " · "
            j = nxt.find(sep)
            if j == -1:
                return ""
            return nxt[:j].strip()
    return ""


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
        tipo = extract_tipo_maps(b)
        rows.append((name, "; ".join(ph) if ph else "—", tipo))
    return rows


def tsv_line(n, p, t):
    tipo = (t or "").strip() or "—"
    return f"{n}\t{p}\t{tipo}"


def main():
    base = Path(__file__).resolve().parent
    in_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else base / "colagem.txt"
    out_main = base / "clientes.tsv"
    out_est = base / "clientes-estetica.tsv"
    out_arq = base / "clientes-arquitetura.tsv"

    if not in_path.is_file():
        print(f"Ficheiro não encontrado: {in_path}", file=sys.stderr)
        print("Uso: python parse_clientes.py [colagem.txt]", file=sys.stderr)
        sys.exit(1)

    raw = in_path.read_text(encoding="utf-8")
    rows = parse_raw(raw)

    estetica = []
    arquitetura = []
    resto = []
    for r in rows:
        n, p, t = r
        b = row_bucket(n, t)
        if b == "e":
            estetica.append(r)
        elif b == "a":
            arquitetura.append(r)
        else:
            resto.append(r)

    header = "empresa\ttelefone\ttipo\n"
    out_main.write_text(
        header + "\n".join(tsv_line(n, p, t) for n, p, t in resto) + "\n",
        encoding="utf-8",
    )
    out_est.write_text(
        header + "\n".join(tsv_line(n, p, t) for n, p, t in estetica) + "\n",
        encoding="utf-8",
    )
    out_arq.write_text(
        header + "\n".join(tsv_line(n, p, t) for n, p, t in arquitetura) + "\n",
        encoding="utf-8",
    )

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print(
        f"Total: {len(rows)} · Estética: {len(estetica)} · Arquitetura: {len(arquitetura)} · Restantes: {len(resto)}"
    )
    print(f"Gravado: {out_main}")
    print(f"Gravado: {out_est}")
    print(f"Gravado: {out_arq}")


if __name__ == "__main__":
    main()
