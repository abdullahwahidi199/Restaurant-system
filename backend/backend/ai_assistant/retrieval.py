"""Conservative selection over existing ranked, authorized discovery; no search engine.

Scores are relative lexical units, never probabilities. Original English domain
words, local intent coverage, primary-guide metadata and separation are required.
Untranslated questions, troubleshooting, compound tasks and conflicting domains
retain explicit model selection. A model's module/topics hints cannot qualify it.
"""
import re
from collections import defaultdict
from dataclasses import dataclass
from functools import lru_cache

from knowledge.markdown import canonical_json
from knowledge.ranking import Aliases, terms


def words(text):
    return {t[:-1] if t.endswith('s') and len(t) > 3 else t for t in terms(text)}


@lru_cache(maxsize=1)
def aliases():
    return Aliases()


def expanded(text):
    weights, _, _ = aliases().query(text, ())
    return words(' '.join(weights))


@dataclass(frozen=True)
class Selection:
    sections: tuple = ()
    reason: str = 'weak_match'


OVERVIEW = re.compile(r'^(page and authority|open .+workspace|open .+|workspace and .+)$', re.I)
FILLER = words('Pakhlai module system use using need needed required field fields control controls purpose explain')
COMPLEX = re.compile(r'\b(why|cannot|can.t|unable|error|fail\w*|troubleshoot\w*|entire|complete|teach|then|through|before|after|undo|refund|automati\w*|self.service)\b', re.I)
ACTION_GROUPS = ({'create', 'add', 'new'}, {'approve', 'approval'}, {'pay', 'paid', 'payment', 'settle'}, {'delete', 'remove'}, {'edit', 'change'}, {'record', 'save', 'enter'})


@lru_cache(maxsize=4)
def domain_owners(index):
    owners = defaultdict(set)
    for doc in index.iter_documents():
        if doc['document_type'] == 'operator_guide':
            for term in words(' '.join([doc['module'], *doc['keywords']])) - FILLER:
                owners[term].add(doc['module'])
    return dict(owners)


def select_sections(question, result, index, config):
    candidates = result.get('results', [])
    if result.get('mode') != 'search' or not candidates:
        return Selection(reason='no_ranked_candidates')
    if not question.isascii():
        return Selection(reason='language_requires_model_selection')
    if COMPLEX.search(question) or len(terms(question)) > 16 or re.search(r'\band\b|[,;]', question, re.I):
        return Selection(reason='complex_or_troubleshooting')
    original = words(question) - FILLER
    # Only metadata of primary module guides contributes domain anchors. Terms
    # shared by several modules cannot select a business domain.
    owners = domain_owners(index)
    domains = {next(iter(owners[t])) for t in original if len(owners.get(t, ())) == 1}
    if len(domains) != 1:
        return Selection(reason='competing_or_missing_domain')
    domain = next(iter(domains))
    scoped = [r for r in candidates if r['module'] == domain and r['document_type'] == 'operator_guide'
              and r['verification_status'] in {'source_verified', 'runtime_verified', 'automated_test_verified'}
              and r['availability'] in {'operator_guidance', 'customer_context'}]
    if not scoped:
        return Selection(reason='no_primary_guide')
    if re.match(r'^what (?:is|are)\b', question, re.I) and not original - words(domain) - {'employee', 'staff'}:
        eligible = [r for r in scoped if OVERVIEW.match(r['title'])]
        if len(eligible) != 1:
            return Selection(reason='overview_not_unique')
        chosen = eligible
        reason = 'primary_overview'
    else:
        query = expanded(question) - FILLER
        actions = [group for group in ACTION_GROUPS if group.intersection(original)]
        # Record a payment is one intent; create AND pay is rejected above.
        if len(actions) > 1 and not all(group.intersection({'record', 'payment', 'pay'}) for group in actions):
            return Selection(reason='multiple_actions')
        eligible = []
        best = max(r['relevance_score'] for r in candidates)
        for r in scoped:
            s = index.get_section(r['section_id'])
            local = expanded(s['heading'] + ' ' + s['content'])
            heading = expanded(s['heading'])
            if not original.issubset(local | FILLER) or not (heading & query) or r['relevance_score'] < best * .72:
                continue
            if actions and not any(expanded(' '.join(group)) & heading for group in actions):
                # Noun headings such as Attendance are precise only when the
                # user's non-action subject is present in that heading.
                subject = original - set().union(*actions) - words(domain)
                if not subject or not subject.issubset(heading):
                    continue
            eligible.append(r)
        eligible.sort(key=lambda r: -r['relevance_score'])
        if not eligible:
            return Selection(reason='local_intent_not_supported')
        if len(eligible) > 1 and eligible[1]['relevance_score'] >= eligible[0]['relevance_score'] * .85:
            return Selection(reason='near_tied_procedures')
        chosen, reason = eligible[:1], 'primary_local_intent'
        # Include discovered navigation from the same guide when available.
        chosen += [r for r in scoped if r['document_id'] == chosen[0]['document_id'] and r not in chosen and OVERVIEW.match(r['title'])]
    if len(chosen) > config.max_sections or len({r['document_id'] for r in chosen}) > config.max_documents:
        return Selection(reason='selection_budget')
    sections = [index.get_section(r['section_id']) for r in chosen]
    if any(not re.sub(r'^#{1,6}\s.*$', '', s['content'], flags=re.M).strip() for s in sections):
        return Selection(reason='empty_section')
    if any(len(s['content']) > 12000 for s in sections) or sum(len(s['content'].encode('utf-8')) for s in sections) > config.evidence_bytes:
        return Selection(reason='complete_evidence_over_budget')
    return Selection(tuple({'document_id': r['document_id'], 'section_id': r['section_id']} for r in chosen), reason)


def compact_candidates(result, config):
    """Drop redundant module context, never truncate Markdown or identifiers."""
    compact = {k: result[k] for k in ('index_version', 'search_token', 'token_expires_in_seconds', 'mode', 'next_offset') if k in result}
    compact.update(results=[], ranking_method=result['ranking_method'], evidence_available=False)
    rows = [{k: r[k] for k in ('document_id', 'section_id', 'document_title', 'title', 'module', 'summary', 'rank')} for r in result['results']]
    for row in rows:
        compact['results'].append({**row, 'summary': row['summary'][:160]})
        if len(canonical_json(compact).encode('utf-8')) + 256 > config.search_bytes:
            compact['results'].pop()
            break
    compact['result_count'] = len(compact['results'])
    compact['omitted_candidates'] = len(rows) - len(compact['results'])
    compact['instruction'] = 'Candidates are discovery only. Fetch complete relevant sections before answering; refine search or browse if needed.'
    if not compact['results'] and rows:
        # Never silently lose the only usable discovery under an impossible
        # budget. The caller reports a bounded tool error for a narrower search.
        from .errors import AssistantError
        raise AssistantError('tool_result_limit', 'Search budget cannot fit a complete candidate; request a narrower search.', 422)
    return compact
