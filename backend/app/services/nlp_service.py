"""
NLP Service — spaCy NER + regex field extraction + document classification
"""
import re
import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

try:
    import spacy
    nlp_model = spacy.load("en_core_web_sm")
    SPACY_OK = True
except Exception:
    SPACY_OK = False
    logger.warning("spaCy model not available — using regex fallback only")


@dataclass
class Entity:
    text: str
    label: str
    confidence: float = 0.95


@dataclass
class NLPResult:
    entities: list = field(default_factory=list)
    fields: dict = field(default_factory=dict)
    classification: str = "unknown"
    classification_confidence: float = 0.0


PATTERNS = {
    "invoice_number": [r"(?:Invoice|INV|Bill)\s*[#№]?\s*:?\s*([A-Z0-9\-]{4,20})"],
    "date": [
        r"(\d{4}[-\/]\d{2}[-\/]\d{2})",
        r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4})",
    ],
    "total_amount": [
        r"(?:Total Due|Grand Total|TOTAL)[:\s]*[\$€£]?\s*([\d,]+\.?\d{0,2})",
        r"[\$€£]\s*([\d,]+\.\d{2})",
    ],
    "email": [r"([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})"],
    "tax_amount": [r"(?:Tax|VAT|GST)[:\s]*[\$€£]?\s*([\d,]+\.?\d{0,2})"],
    "po_number": [r"(?:PO|Purchase Order)\s*[#:]?\s*([A-Z0-9\-]+)"],
}

CLASSIFIERS = {
    "invoice": ["invoice", "inv #", "bill to", "amount due", "payment terms"],
    "contract": ["agreement", "party", "whereas", "hereinafter", "terms and conditions"],
    "medical": ["patient", "diagnosis", "medication", "physician"],
    "passport": ["passport", "nationality", "date of birth", "mrz"],
    "receipt": ["receipt", "subtotal", "cashier", "thank you"],
    "bank_statement": ["account number", "statement period", "balance", "debit"],
    "report": ["executive summary", "findings", "recommendations", "appendix"],
}


class NLPService:
    def extract(self, text: str) -> NLPResult:
        result = NLPResult()
        result.classification, result.classification_confidence = self._classify(text)
        result.fields = self._extract_fields(text)
        result.entities = self._extract_entities(text)
        return result

    def _classify(self, text: str):
        tl = text.lower()
        scores = {k: sum(1 for kw in kws if kw in tl) / len(kws)
                  for k, kws in CLASSIFIERS.items()}
        scores = {k: v for k, v in scores.items() if v > 0}
        if not scores:
            return "unknown", 0.5
        best = max(scores, key=scores.get)
        return best, round(min(scores[best] * 2, 0.99), 3)

    def _extract_fields(self, text: str):
        fields = {}
        for fname, patterns in PATTERNS.items():
            for pat in patterns:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    fields[fname] = {
                        "value": m.group(1).strip(),
                        "confidence": round(0.88 + 0.08 * (len(m.group(1)) > 4), 3),
                    }
                    break
        return fields

    def _extract_entities(self, text: str):
        if not SPACY_OK:
            return []
        doc = nlp_model(text[:50000])
        return [Entity(e.text, e.label_) for e in doc.ents]


nlp_service = NLPService()
