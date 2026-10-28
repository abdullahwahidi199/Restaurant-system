"""Local measurements only. Mock-provider time is not DeepSeek latency."""
import gc
import math
import statistics
import time
import tracemalloc

from knowledge.fetch import fetch_sections
from knowledge.gateway import KnowledgeGateway
from knowledge.loader import load_index
from knowledge.repository import IndexRepository
from ai_assistant.config import Limits
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.testing import DemoProvider

from .dataset import evaluation_principal
from .retrieval import FixedSnapshot


def statistics_ms(values):
    ordered = sorted(values)
    return {"samples": len(values), "median_ms": statistics.median(ordered), "p95_ms": ordered[math.ceil(.95 * len(ordered)) - 1], "min_ms": ordered[0], "max_ms": ordered[-1]}


def measure(action, count):
    samples = []
    for number in range(count):
        started = time.perf_counter()
        action(number)
        samples.append((time.perf_counter() - started) * 1000)
    return statistics_ms(samples)


def evaluate_performance(index_root, records, config):
    principal = evaluation_principal("Admin")
    count = config["performance_samples"]
    index = load_index(index_root)
    gateway = KnowledgeGateway(repository=FixedSnapshot(index), principal_resolver=lambda user: principal)
    question = "How do I record a contractor payment?"
    found = gateway.search_documentation(user=object(), query=question)
    selected = found["results"][0]
    selection = {key: selected[key] for key in ("document_id", "section_id")}
    repository = IndexRepository(index_root)
    cached = repository.get()
    queries = [r["question"] for r in records if r["language"] == "en" and r["retrieval_metric"]]
    measurements = {
        "index_load_uncached": measure(lambda _: load_index(index_root), config["load_samples"]),
        "cached_snapshot_check": measure(lambda _: repository.get(), count),
        "search_warm": measure(lambda i: gateway.search_documentation(user=object(), query=queries[i % len(queries)]), count),
        "fetch_materialization": measure(lambda _: fetch_sections(index, principal, [selection], {(selection['document_id'], selection['section_id'])}), count),
        "gateway_dispatch_fetch": measure(lambda _: gateway.execute(name="fetch_documentation", arguments={"search_token": found["search_token"], "sections": [selection]}, user=object()), count),
        "mock_orchestration": measure(lambda _: Orchestrator(DemoProvider(question), gateway, Limits()).run(user=object(), question=question), count),
    }
    gc.collect()
    tracemalloc.start()
    start, _ = tracemalloc.get_traced_memory()
    measured_index = load_index(index_root)
    loaded, peak_load = tracemalloc.get_traced_memory()
    measured_gateway = KnowledgeGateway(repository=FixedSnapshot(measured_index), principal_resolver=lambda user: principal)
    measured_gateway.search_documentation(user=object(), query=question)
    prepared, peak_prepared = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    assert repository.get() is cached
    return {"timings": measurements, "memory": {"measurement": "Python allocations via tracemalloc in a separate pass; timings above are uninstrumented. Not total process RSS.", "loaded_index_current_bytes": loaded - start, "load_peak_bytes": peak_load - start, "index_plus_prepared_search_bytes": prepared - start, "prepared_peak_bytes": peak_prepared - start},
            "cache_identity_reused": True, "scope": "Local trusted synthetic Admin context, immutable index. No authentication DB/network/provider delay. Mock orchestration uses the real engine and gateway.",
            "quantile_method": "p95 nearest-rank ceil(0.95*n); timings are representative environment measurements, not production SLAs."}
