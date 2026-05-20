"""
HTML/JSON lawyer-profile extractor.

Tries multiple strategies in order:
  1. JSON response (the URL returns application/json with a lawyers array)
  2. HTML tables with header columns matching lawyer-directory patterns
  3. Repeated card/article/li blocks containing name + phone/email pairs
  4. Full-page pattern scan: regex for phones + emails, name from nearest heading

Returns a list of dicts with keys: full_name, phone, city, email (optional),
region (optional), source_url.
"""

import re
import logging
from urllib.parse import urlparse

from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ── Phone patterns for Cameroon ────────────────────────────────────────────────
# Mobile: 6[5-8]XXXXXXX  Landline: 2[23]XXXXXXX  Optional +237 prefix
_PHONE_RE = re.compile(
    r'(?:\+?237[\s\-.]?)?(?:6[5678]|2[23])[\s\-.]?\d{2,3}[\s\-.]?\d{2,3}[\s\-.]?\d{2,3}'
)
_EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')

_CITY_HINTS = {
    "douala":     "Douala",
    "yaounde":    "Yaoundé",
    "yaoundé":    "Yaoundé",
    "bamenda":    "Bamenda",
    "garoua":     "Garoua",
    "bafoussam":  "Bafoussam",
    "ngaoundere": "Ngaoundéré",
    "maroua":     "Maroua",
    "bertoua":    "Bertoua",
    "ebolowa":    "Ebolowa",
}

# Column header synonyms for lawyer directories
_NAME_HEADERS   = {"nom", "name", "lawyer", "avocat", "attorney", "counsel", "full name", "barrister"}
_PHONE_HEADERS  = {"téléphone", "telephone", "phone", "tel", "mobile", "contact"}
_EMAIL_HEADERS  = {"email", "e-mail", "mail", "courriel"}
_CITY_HEADERS   = {"ville", "city", "location", "barreau", "region", "région"}

# Heading tags that usually contain a person's name
_HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "strong", "b"]


def city_from_url(url: str) -> str:
    host = urlparse(url).hostname or ""
    path = urlparse(url).path or ""
    combined = (host + path).lower()
    for key, city in _CITY_HINTS.items():
        if key in combined:
            return city
    return "Douala"


def _clean_phone(raw: str) -> str | None:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("237") and len(digits) >= 11:
        digits = digits[3:]
    if len(digits) < 8:
        return None
    return digits[:9]


def _normalize(lawyers: list[dict], source_url: str, default_city: str) -> list[dict]:
    out = []
    seen = set()
    for rec in lawyers:
        name  = (rec.get("full_name") or "").strip()
        phone = _clean_phone(rec.get("phone") or "")
        city  = (rec.get("city") or default_city).strip() or default_city
        if not name or not phone:
            continue
        key = (name.lower(), phone)
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "full_name":  name,
            "phone":      phone,
            "city":       city,
            "email":      (rec.get("email") or "").strip() or None,
            "region":     (rec.get("region") or "").strip() or None,
            "source_url": source_url,
        })
    return out


# ── Strategy 1: JSON ───────────────────────────────────────────────────────────

def _from_json(data, source_url: str, default_city: str) -> list[dict]:
    """Handle JSON responses that contain a list of lawyer objects."""
    items = []
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        for v in data.values():
            if isinstance(v, list) and v:
                items = v
                break

    lawyers = []
    for item in items:
        if not isinstance(item, dict):
            continue
        name = (
            item.get("full_name") or item.get("name") or
            item.get("nom") or item.get("lawyer_name") or ""
        )
        phone = (
            item.get("phone") or item.get("telephone") or
            item.get("tel") or item.get("mobile") or ""
        )
        lawyers.append({
            "full_name": name,
            "phone":     phone,
            "email":     item.get("email") or item.get("mail") or "",
            "city":      item.get("city") or item.get("ville") or default_city,
            "region":    item.get("region") or item.get("région") or "",
        })
    return _normalize(lawyers, source_url, default_city)


# ── Strategy 2: HTML tables ────────────────────────────────────────────────────

def _col_index(headers: list[str], synonyms: set) -> int | None:
    for i, h in enumerate(headers):
        if h.lower().strip() in synonyms:
            return i
    return None


def _from_tables(soup: BeautifulSoup, source_url: str, default_city: str) -> list[dict]:
    lawyers = []
    for table in soup.find_all("table"):
        ths = [th.get_text(" ", strip=True) for th in table.find_all("th")]
        if not ths:
            # Try first row as header
            first_row = table.find("tr")
            if first_row:
                ths = [td.get_text(" ", strip=True) for td in first_row.find_all(["td", "th"])]

        name_idx  = _col_index(ths, _NAME_HEADERS)
        phone_idx = _col_index(ths, _PHONE_HEADERS)
        if name_idx is None or phone_idx is None:
            continue

        email_idx = _col_index(ths, _EMAIL_HEADERS)
        city_idx  = _col_index(ths, _CITY_HEADERS)

        for row in table.find_all("tr")[1:]:
            cells = [td.get_text(" ", strip=True) for td in row.find_all("td")]
            if len(cells) <= max(filter(None, [name_idx, phone_idx])):
                continue
            lawyers.append({
                "full_name": cells[name_idx] if name_idx < len(cells) else "",
                "phone":     cells[phone_idx] if phone_idx < len(cells) else "",
                "email":     cells[email_idx] if email_idx is not None and email_idx < len(cells) else "",
                "city":      cells[city_idx]  if city_idx  is not None and city_idx  < len(cells) else default_city,
                "region":    "",
            })

    return _normalize(lawyers, source_url, default_city)


# ── Strategy 3: Repeated card blocks ──────────────────────────────────────────

def _from_cards(soup: BeautifulSoup, source_url: str, default_city: str) -> list[dict]:
    """Look for repeated block-level elements that each contain a name + phone."""
    candidates = []
    for tag in ["article", "li", "div"]:
        blocks = soup.find_all(tag)
        hits = []
        for block in blocks:
            text = block.get_text(" ", strip=True)
            phones = _PHONE_RE.findall(text)
            if not phones:
                continue
            # Look for a heading inside the block for the name
            name_el = block.find(_HEADING_TAGS)
            name = name_el.get_text(" ", strip=True) if name_el else ""
            if not name:
                # Try first line of text
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                name = lines[0] if lines else ""
            emails = _EMAIL_RE.findall(text)
            hits.append({
                "full_name": name,
                "phone":     phones[0],
                "email":     emails[0] if emails else "",
                "city":      default_city,
                "region":    "",
            })
        if len(hits) >= 3:
            candidates.extend(hits)
            break  # stop after first tag type that gives results

    return _normalize(candidates, source_url, default_city)


# ── Strategy 4: Full-page pattern scan ────────────────────────────────────────

def _from_patterns(soup: BeautifulSoup, source_url: str, default_city: str) -> list[dict]:
    """
    Walk the soup tree. For every phone number found in a text node,
    look at the nearest heading above it in the DOM for a name.
    """
    # Build a flat list of (element, text) for heading tags
    heading_positions = []
    all_elements = list(soup.descendants)
    for i, el in enumerate(all_elements):
        if hasattr(el, "name") and el.name in _HEADING_TAGS:
            heading_positions.append((i, el.get_text(" ", strip=True)))

    lawyers = []
    text = soup.get_text(separator="\n")
    for phone_match in _PHONE_RE.finditer(text):
        phone_raw = phone_match.group()
        cleaned = _clean_phone(phone_raw)
        if not cleaned:
            continue
        # Find nearest email in surrounding text
        surrounding = text[max(0, phone_match.start()-200): phone_match.end()+200]
        emails = _EMAIL_RE.findall(surrounding)
        # Find the nearest heading by scanning backwards through the page text
        before = text[:phone_match.start()]
        name = ""
        for line in reversed(before.split("\n")):
            line = line.strip()
            if 3 < len(line) < 80 and not _PHONE_RE.search(line) and not _EMAIL_RE.search(line):
                # Heuristic: proper name has at least 2 words, mostly letters
                words = line.split()
                if len(words) >= 2 and sum(w[0].isupper() for w in words if w) >= 1:
                    name = line
                    break

        if name:
            lawyers.append({
                "full_name": name,
                "phone":     cleaned,
                "email":     emails[0] if emails else "",
                "city":      default_city,
                "region":    "",
            })

    return _normalize(lawyers, source_url, default_city)


# ── Public entry point ─────────────────────────────────────────────────────────

def extract(response_text: str, content_type: str, source_url: str) -> list[dict]:
    default_city = city_from_url(source_url)

    # Strategy 1: JSON
    if "json" in content_type:
        import json as _json
        try:
            data = _json.loads(response_text)
            result = _from_json(data, source_url, default_city)
            if result:
                logger.info("JSON strategy: %d lawyers", len(result))
                return result
        except Exception:
            pass

    soup = BeautifulSoup(response_text, "lxml")

    # Strategy 2: tables
    result = _from_tables(soup, source_url, default_city)
    if result:
        logger.info("Table strategy: %d lawyers", len(result))
        return result

    # Strategy 3: cards
    result = _from_cards(soup, source_url, default_city)
    if result:
        logger.info("Card strategy: %d lawyers", len(result))
        return result

    # Strategy 4: pattern scan
    result = _from_patterns(soup, source_url, default_city)
    logger.info("Pattern strategy: %d lawyers", len(result))
    return result
