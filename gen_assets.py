# -*- coding: utf-8 -*-
"""Génère le logo et les images de produits (SVG) de Mouasmor Store."""
import os

IMG = os.path.join(os.path.dirname(__file__), "img")
NAVY = "#151424"
GOLD = "#c3a15a"


def logo_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="{NAVY}"/>
  <path d="M14 20 L32 48 L50 20 L42 20 L32 37 L22 20 Z" fill="#ffffff"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="{GOLD}"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="{GOLD}"/>
</svg>'''


def favicon_svg():
    return logo_svg()


def _bg(c1, c2, accent):
    return (
        f'<defs>'
        f'<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">'
        f'<stop offset="0%" stop-color="{c1}"/>'
        f'<stop offset="100%" stop-color="{c2}"/>'
        f'</linearGradient>'
        f'</defs>'
        f'<rect width="800" height="800" fill="url(#bg)"/>'
        f'<rect x="30" y="30" width="740" height="740" fill="none" stroke="{accent}" '
        f'stroke-opacity=".35" stroke-width="3" rx="20"/>'
        f'<circle cx="744" cy="56" r="96" fill="#ffffff" fill-opacity=".06"/>'
        f'<circle cx="56" cy="744" r="140" fill="#ffffff" fill-opacity=".05"/>'
        f'<circle cx="706" cy="724" r="44" fill="{accent}" fill-opacity="{0.12 if accent.startswith("#") else ".12"}"/>'
    )


def _frame(color, opacity=".9"):
    return f'stroke="{color}" stroke-opacity="{opacity}" fill="none"'


def tissu_svg(accent):
    s = _bg("#40405e", "#181828", accent)
    s += f'''<g transform="translate(400,400)" stroke="{accent}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".95">
  <path d="M-190-190 L190-190 L190 190 L-190 190 Z"/>
  <path d="M-190-190 L190 190"/>
  <path d="M-190 190 L190-190" opacity=".8"/>
  <path d="M-190-55 L190-55" opacity=".55"/>
  <path d="M-190 55 L190 55" opacity=".55"/>
  <path d="M-55-190 L-55 190" opacity=".55"/>
  <path d="M55-190 L55 190" opacity=".55"/>
</g>
<circle cx="400" cy="400" r="158" stroke="#ffffff" stroke-width="4" opacity=".3" fill="none"/>
<circle cx="400" cy="400" r="124" stroke="#ffffff" stroke-width="3" opacity=".2" fill="none"/>'''
    return s


def parfum_svg(accent):
    s = _bg("#2f3250", "#111022", accent)
    s += f'''<g transform="translate(400,426)" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <rect x="-110" y="-180" width="220" height="220" rx="26" stroke="{accent}" stroke-width="16" opacity=".95"/>
  <path d="M-30-180 l60 0 l0-60 a30 30 0 0 0 -60 0 Z" stroke="#ffffff" stroke-width="12" opacity=".95"/>
  <circle cx="0" cy="-40" r="16" fill="{accent}"/>
  <rect x="-52" y="40" width="104" height="22" rx="11" fill="{accent}" opacity=".95"/>
  <path d="M-70 96 Q0 128 70 96" stroke="{accent}" stroke-width="14" opacity=".95"/>
  <path d="M-74 132 Q0 168 74 132" stroke="#ffffff" stroke-width="12" opacity=".55"/>
</g>
<path d="M140 168 Q170 150 176 116" stroke="#ffffff" stroke-width="6" opacity=".25" fill="none" stroke-linecap="round"/>
<path d="M166 176 Q200 158 204 122" stroke="#ffffff" stroke-width="6" opacity=".2" fill="none" stroke-linecap="round"/>'''
    return s


# (couleur1, couleur2, accent) par produit -> réutilisé pour des dégradés uniques
PROD_ASSETS = {
    "tissus": tissu_svg,
    "parfums": parfum_svg,
}

ACCENTS = [
    "#d4b678", "#c3a15a", "#e0c98f", "#b08d4a",
    "#cfb577", "#e8d5a4", "#c9a95f", "#d9c086",
    "#bfa14f", "#deca92",
]


def svg_document(inner):
    """Enveloppe le contenu généré dans un document SVG valide (800x800)."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" '
        f'width="800" height="800">{inner}</svg>'
    )


def main():
    os.makedirs(os.path.join(IMG, "produits"), exist_ok=True)
    with open(os.path.join(IMG, "logo.svg"), "w", encoding="utf-8") as f:
        f.write(logo_svg())
    with open(os.path.join(IMG, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(favicon_svg())

    used = {}
    # Les tissus utilisent de vraies photos (img-tissus/) : on ne garde qu'une icône.
    nb = {"tissus": 1, "parfums": 4}
    a = {"tissus": 0, "parfums": 3}
    for cat, fn in PROD_ASSETS.items():
        for i in range(nb[cat]):
            acc = ACCENTS[(a[cat] + i) % len(ACCENTS)]
            name = f"{cat}-{i + 1}.svg"
            with open(os.path.join(IMG, "produits", name), "w", encoding="utf-8") as f:
                f.write(svg_document(fn(acc)))
            used.setdefault(cat, []).append(name)
    print("Assets générés OK")
    for cat, names in used.items():
        print(" ", cat, names)


if __name__ == "__main__":
    main()