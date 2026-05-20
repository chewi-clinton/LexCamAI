"""
Extracts legal articles from a PDF byte stream.

Strategy:
  1. Extract full text with pdfplumber (handles multi-column, tables, headers)
  2. Locate article boundaries with a regex that matches common French/English
     law formats: "Article 1", "Art. 1", "ARTICLE 1", "Article 1er"
  3. Treat the text between consecutive article headers as the article body
  4. Optionally detect a short title on the first line of the body
"""
from __future__ import annotations

import io
import re

import pdfplumber

# Matches the start of an article header line.
# Group 1 → article number (e.g. "1", "23bis", "1er")
# Group 2 → remainder of the header line (often the article title)
_ARTICLE_RE = re.compile(
    r"(?m)^(?:ARTICLE|Article|Art\.)\s+(\d+\w*|1er)\s*[.:\-–—]?\s*(.*)",
)

_DOMAIN_MAP: dict[str, list[str]] = {
    "labor":      ["travail", "labor", "emploi", "salaire", "employeur", "licenci", "smig", "wage"],
    "civil":      ["civil", "famille", "mariage", "divorce", "succession", "héritage", "tutelle"],
    "criminal":   ["pénal", "penal", "crime", "délit", "peine", "prison", "infraction", "sanction"],
    "commercial": ["commercial", "société", "entreprise", "ohada", "rccm", "commerce", "contrat"],
    "housing":    ["foncier", "land", "logement", "loyer", "bail", "propriété", "locataire"],
    "family":     ["famille", "mariage", "enfant", "adoption", "tutelle", "parenté"],
}


def _detect_domain(text: str, law_name: str = "") -> str:
    combined = (text[:1000] + " " + law_name).lower()
    for domain, keywords in _DOMAIN_MAP.items():
        if any(kw in combined for kw in keywords):
            return domain
    return "general"


def parse_pdf(pdf_bytes: bytes, domain: str, language: str = "fr") -> list[dict]:
    """
    Parse a PDF and return a list of article dicts ready for the KB ingest endpoint.
    Each dict has: article_number, title, full_text, domain, language, plain_summary, chapter.
    """
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        pages_text = []
        for page in pdf.pages:
            text = page.extract_text(x_tolerance=2, y_tolerance=3)
            if text:
                pages_text.append(text)
    full_text = "\n".join(pages_text)

    if not domain or domain == "general":
        domain = _detect_domain(full_text)

    matches = list(_ARTICLE_RE.finditer(full_text))
    if not matches:
        return []

    articles = []
    for i, m in enumerate(matches):
        num = m.group(1).strip()
        header_tail = m.group(2).strip()  # rest of the article header line

        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        raw_body = full_text[body_start:body_end].strip()

        # Combine header tail + body for full text
        full_body = (header_tail + "\n" + raw_body).strip() if header_tail else raw_body

        # Clean whitespace
        full_body = re.sub(r"[ \t]+", " ", full_body)
        full_body = re.sub(r"\n{3,}", "\n\n", full_body).strip()

        if len(full_body) < 20:
            continue

        # Extract a short title from the first line if it's under 120 chars
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
