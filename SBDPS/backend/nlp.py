"""Lightweight NLP: map free text (English / Hinglish / Hindi) to symptom codes."""
import re
import unicodedata

_NEG_BEFORE = re.compile(r"\b(no|not|without|never|nahi|nahin|bina)\s+(\S+\s+)?$")
_NEG_AFTER = re.compile(r"^\s*(nahi|nahin|nhi|नहीं)")


def normalize(text: str) -> str:
    """Lower-case and replace punctuation/symbols with spaces (keeps Devanagari letters and marks)."""
    out = "".join(" " if unicodedata.category(ch)[0] in "PS" else ch for ch in text.lower())
    return " " + re.sub(r"\s+", " ", out) + " "


class SymptomExtractor:
    def __init__(self, symptoms: list[dict]):
        self.symptoms = symptoms

    def extract(self, text: str) -> list[str]:
        """Return the codes of symptoms mentioned in `text`, ignoring negated mentions."""
        t = normalize(text or "")
        found: list[str] = []
        for s in self.symptoms:
            if self._mentioned(t, s["aliases"]):
                found.append(s["code"])
        return found

    @staticmethod
    def _mentioned(t: str, aliases: list[str]) -> bool:
        for alias in aliases:
            if not alias:
                continue
            i = t.find(alias)
            while i >= 0:
                before = t[max(0, i - 16):i]
                after = t[i + len(alias):i + len(alias) + 12]
                if not (_NEG_BEFORE.search(before) or _NEG_AFTER.search(after)):
                    return True
                i = t.find(alias, i + 1)
        return False
