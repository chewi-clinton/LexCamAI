"""
Extracts legal articles from HTML pages of law portals.

Targets:
  - droit-afrique.com  (French Cameroonian law texts)
  - ohada.com          (OHADA uniform acts)
  - juriafrica.com     (West/Central African law)
  - Generic fallback   (any page with Article N headers)

Returns a list of article dicts matching the KB ingest schema:
  article_number, title, full_text, domain, language, plain_summary, chapter
"""
from __future__ import annotations

import re
from bs4 import BeautifulSoup

# Matches "Article 1", "Art. 1", "ARTICLE 1", "Article 1er" at start of a line
_ARTICLE_RE = re.compile(
    r"(?:^|\n)\s*(?:ARTICLE|Article|Art\.)\s+(\d+\w*|1er)\s*[.:\-–—]?\s*(.*)",
)

_DOMAIN_MAP: dict[str, list[str]] = {
    "labor":      ["travail", "labor", "emploi", "salaire", "employeur", "licenci", "smig", "wage", "congé"],
    "civil":      ["civil", "famille", "mariage", "divorce", "succession", "héritage", "tutelle"],
    "criminal":   ["pénal", "penal", "crime", "délit", "peine", "prison", "infraction", "sanction"],
    "commercial": ["commercial", "société", "entreprise", "ohada", "rccm", "commerce", "contrat"],
    "housing":    ["foncier", "land", "logement", "loyer", "bail", "propriété", "locataire", "terrain"],
    "family":     ["famille", "mariage", "enfant", "adoption", "tutelle", "parenté", "mineur"],
}


def _detect_domain(text: str, law_name: str = "") -> str:
    combined = (text[:2000] + " " + law_name).lower()
    for domain, keywords in _DOMAIN_MAP.items():
        if any(kw in combined for kw in keywords):
            return domain
    return "general"


def _clean_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _parse_articles(text: str, domain: str, language: str, law_name: str) -> list[dict]:
    if not domain or domain == "general":
        domain = _detect_domain(text, law_name)

    matches = list(_ARTICLE_RE.finditer(text))
    if not matches:
        return []

    articles = []
    for i, m in enumerate(matches):
        num = m.group(1).strip()
        header_tail = m.group(2).strip()

        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        raw_body = _clean_text(text[body_start:body_end])

        full_body = (header_tail + "\n" + raw_body).strip() if header_tail else raw_body
        if len(full_body) < 20:
            continue

        lines = [l.strip() for l in full_body.split("\n") if l.strip()]
        if lines and len(lines[0]) < 120 and len(lines) > 1:
            title = lines[0]
            body_text = "\n".join(lines[1:]).strip() or full_body
        else:
            title = None
            body_text = full_body

        articles.append({
            "article_number": f"Art. {num}",
            "title": title or None,
            "full_text": body_text,
            "domain": domain,
            "language": language,
            "plain_summary": None,
            "chapter": None,
        })

    return articles


def _soup_to_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "nav", "header", "footer", "aside",
                     "form", "button", "noscript"]):
        tag.decompose()

    # droit-afrique: law text is usually in <div class="content"> or <article>
    for selector in ["article", "div.content", "div.law-text", "div.texte",
                     "div#content", "div.article-body", "main"]:
        el = soup.select_one(selector)
        if el:
            return el.get_text(separator="\n", strip=True)

    return soup.get_text(separator="\n", strip=True)


def extract(html: str, source_url: str, domain: str, language: str, law_name: str) -> list[dict]:
    """
    Parse HTML from a law portal and return structured article dicts.
    """
    soup = BeautifulSoup(html, "lxml")
    text = _soup_to_text(soup)
    return _parse_articles(text, domain=domain, language=language, law_name=law_name)
