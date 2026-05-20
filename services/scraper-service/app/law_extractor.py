"""
Extracts legal articles from HTML pages of law portals.

Targets:
  - droit-afrique.com  (French Cameroonian law texts)
  - ohada.com          (OHADA uniform acts)
  - juriafrica.com     (West/Central African law)
  - juriafrica.com     (West/Central African law)
  - refworld.org       (UNHCR refugee law / national legislation)
  - ilo.org/natlex     (ILO national labour legislation)
  - wipolex.wipo.int   (WIPO intellectual property legislation)
  - Generic fallback   (any page with Article N headers)

Returns a list of article dicts matching the KB ingest schema:
  article_number, title, full_text, domain, language, plain_summary, chapter
"""
from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse
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


# Keywords that suggest a link points to an individual law text (not navigation/search).
_LAW_LINK_KEYWORDS = {
    "code", "loi", "decret", "ordonnance", "acte", "arrete", "circulaire",
    "legislation", "texte", "law", "act", "decree", "statute", "regulation",
    "penal", "travail", "civil", "foncier", "famille", "commerce", "ohada",
}

_SKIP_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"}


def find_pdf_links(html: str, base_url: str, max_results: int = 5) -> list[str]:
    """
    Extract PDF download links from a law portal listing page, same domain only.
    """
    soup = BeautifulSoup(html, "lxml")
    base_domain_bare = urlparse(base_url).netloc.removeprefix("www.")
    seen: set[str] = set()
    result: list[str] = []

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href:
            continue
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        if parsed.netloc.removeprefix("www.") != base_domain_bare:
            continue
        if not parsed.path.lower().endswith(".pdf"):
            continue
        if full_url in seen:
            continue

        # prefer links whose path or anchor text hints at law content
        path_lower = parsed.path.lower()
        anchor_lower = (a.get_text() or "").lower()
        is_law = any(kw in path_lower or kw in anchor_lower for kw in _LAW_LINK_KEYWORDS)

        seen.add(full_url)
        if is_law:
            result.insert(0, full_url)  # prioritise law-keyword matches
        else:
            result.append(full_url)

        if len(result) >= max_results:
            break

    return result[:max_results]


def find_law_links(html: str, base_url: str) -> list[str]:
    """
    From a law portal listing/index page, extract hrefs that likely point to
    individual law text pages (same domain, law-keyword in path, not binary files).
    Falls back to any deep internal links when keyword matching finds nothing.
    Returns deduplicated list capped at 15 candidates.
    """
    soup = BeautifulSoup(html, "lxml")
    base_domain_bare = urlparse(base_url).netloc.removeprefix("www.")
    seen: set[str] = set()
    keyword_matches: list[str] = []
    fallback_links: list[str] = []

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith("#") or href.lower().startswith("javascript"):
            continue
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        # same domain (ignore www. prefix difference)
        if parsed.netloc.removeprefix("www.") != base_domain_bare:
            continue
        # skip binary file links
        if any(parsed.path.lower().endswith(ext) for ext in _SKIP_EXTENSIONS):
            continue

        path_lower = parsed.path.lower()
        anchor_lower = (a.get_text() or "").lower()

        if full_url in seen:
            continue
        seen.add(full_url)

        if any(kw in path_lower or kw in anchor_lower for kw in _LAW_LINK_KEYWORDS):
            keyword_matches.append(full_url)
        elif len(path_lower.split("/")) >= 3 and len(path_lower) > 4:
            # deep internal link — potential content page (used as fallback)
            fallback_links.append(full_url)

    # prefer keyword matches; fall back to all deep internal links when 0 found
    result = keyword_matches if keyword_matches else fallback_links
    return result[:15]
