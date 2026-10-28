"""Deterministic weighted, length-normalized lexical relevance, not confidence."""
import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path

FIELD_WEIGHTS = {"heading": 12.0, "title": 7.0, "module": 6.0, "description": 4.0, "keywords": 6.0, "capability": 9.0, "content": 1.5}
TYPE_WEIGHTS = {"operator_guide": 1.35, "workflow": 1.25, "form_reference": 1.25, "troubleshooting": 1.2, "role_guide": 1.0, "navigation": .85, "interface_reference": .65, "backend_reference": .55}
STOPWORDS = frozenset("a an the how do does did i we you my to for of in on at is are can could would should please me someone it this that and or with what which from be as about".split())


def normalize(text):
    return unicodedata.normalize("NFC", text).casefold()


def terms(text):
    return [t for t in re.findall(r"[^\W_]+", normalize(text), flags=re.UNICODE) if t not in STOPWORDS]


class Aliases:
    def __init__(self):
        data = json.loads(Path(__file__).with_name("aliases.json").read_text(encoding="utf-8"))
        self.groups = data["groups"]
        self.phrases = data["phrase_groups"]

    def query(self, query, topics):
        weights = {t: 1.0 for t in terms(query)}
        original = set(weights)
        for topic in topics:
            for term in terms(topic):
                weights.setdefault(term, .55)
        for group in self.groups:
            if set(group).intersection(weights):
                for term in group:
                    weights.setdefault(term, .4)
        quoted = [normalize(p) for p in re.findall(r'["“]([^"”]+)["”]', query)]
        phrases = quoted or ([" ".join(terms(query))] if 1 < len(original) <= 12 else [])
        for group in self.phrases:
            if any(phrase in normalize(query) for phrase in group):
                phrases.extend(group)
        return weights, original, list(dict.fromkeys(phrases))


def lexical_score(record, query_weights, phrases, idf, averages):
    score = 0.0
    for field, weight in FIELD_WEIGHTS.items():
        counts = record["counts"][field]
        length = record["lengths"][field]
        normalizer = 1.2 * (.25 + .75 * length / max(1, averages[field]))
        for term, query_weight in query_weights.items():
            tf = counts.get(term, 0)
            if tf:
                score += weight * query_weight * idf[term] * (tf * 2.2 / (tf + normalizer))
    # Phrase bonuses are explicit substring matches after NFC/casefold only.
    for phrase in phrases:
        if len(phrase) < 3:
            continue
        for field, bonus in (("heading", 30), ("title", 22), ("capability", 16), ("description", 6), ("content", 2)):
            if phrase in record["text"][field]:
                score += bonus
    return score


def inverse_frequency(total, frequency):
    return 1.0 + math.log((total + 1.0) / (frequency + 1.0))


def prepare(fields):
    counters = {name: Counter(terms(value)) for name, value in fields.items()}
    return {"text": {name: normalize(value) for name, value in fields.items()}, "counts": counters, "lengths": {name: sum(count.values()) for name, count in counters.items()}, "terms": set().union(*(set(count) for count in counters.values()))}
