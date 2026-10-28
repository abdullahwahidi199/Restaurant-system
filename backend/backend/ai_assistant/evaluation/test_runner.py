"""Django test isolation with per-test machine-readable statuses, no raw traces."""
import io
import time

from django.test.runner import DiscoverRunner
from django.test import override_settings
import unittest


def run_tests(labels):
    cases = []
    class RecordedResult(unittest.TextTestResult):
        def startTest(self, test):
            test._evaluation_started = time.perf_counter()
            super().startTest(test)

        def record(self, test, status, error=None):
            started = getattr(test, "_evaluation_started", getattr(getattr(test, "test_case", None), "_evaluation_started", None))
            cases.append({"id": test.id(), "status": status, "duration_ms": (time.perf_counter() - started) * 1000 if started is not None else None,
                          **({"error_type": error[0].__name__} if error else {})})

        def addSuccess(self, test):
            self.record(test, "passed")
            super().addSuccess(test)

        def addFailure(self, test, err):
            self.record(test, "failed", err)
            super().addFailure(test, err)

        def addError(self, test, err):
            self.record(test, "error", err)
            super().addError(test, err)

        def addSkip(self, test, reason):
            self.record(test, "skipped")
            super().addSkip(test, reason)

        def addSubTest(self, test, subtest, err):
            if err:
                self.record(subtest, "failed", err)
            super().addSubTest(test, subtest, err)

    class Runner(DiscoverRunner):
        recorded_result = None

        def get_resultclass(self):
            return RecordedResult

        def run_suite(self, suite, **kwargs):
            self.recorded_result = super().run_suite(suite, **kwargs)
            return self.recorded_result

        def get_test_runner_kwargs(self):
            return {**super().get_test_runner_kwargs(), "stream": io.StringIO()}

    settings = {"DEEPSEEK_API_KEY": "", "CACHES": {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "assistant-evaluation"}},
                "CHANNEL_LAYERS": {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}}
    with override_settings(**settings):
        runner = Runner(verbosity=0, interactive=False)
        failures = runner.run_tests(list(dict.fromkeys(labels)))
    return {"tests_run": runner.recorded_result.testsRun, "failures": failures, "passed": sum(c["status"] == "passed" for c in cases), "skipped": sum(c["status"] == "skipped" for c in cases), "cases": cases,
            "note": "Mock providers/isolated Django test database. Test statuses and latency do not verify real model answer quality."}
