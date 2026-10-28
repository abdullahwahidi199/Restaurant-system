# Reproduce the offline assistant evaluation

Run from `Restaurant-system/backend/backend` after building the existing knowledge index:

```powershell
python manage.py evaluate_ai_assistant --all
python manage.py evaluate_ai_assistant --retrieval
python manage.py evaluate_ai_assistant --orchestration
python manage.py evaluate_ai_assistant --security
python manage.py evaluate_ai_assistant --performance
```

No flags means all four selections. The runner never calls a live provider. It validates the frozen question annotations, uses the real gateway, runs selected Django tests in an isolated test database, measures local resources, writes JSON and prints a concise summary. Failed deterministic checks produce a nonzero exit status **after** writing results. A recall goal is reported as a quality target, not silently enforced by changing expectations.

Default inputs/output are this directory's `config.json`, `questions.jsonl` and `results.json`. Both the current index version and dataset digest are pinned. A refreshed corpus needs an explicit source-annotation review and a new versioned configuration; do not repoint expected sections at whatever currently ranks first. Validation never invokes search to author its expectations.

Useful explicit paths/comparison:

```powershell
python manage.py evaluate_ai_assistant --all --output ../../docs/ai_knowledge/evaluation/new_results.json --baseline ../../docs/ai_knowledge/evaluation/baseline.json
```

`--config` accepts another reviewed development configuration. The baseline comparison requires the same dataset, configuration and index hashes. Output cannot overwrite the preserved baseline passed with `--baseline`, the operator source tree or configuration. Keep `baseline.json` unchanged. The supplied baseline corresponds to the clean pre-hardening production code; final source fingerprints differ as recorded in JSON. All input/output paths are trusted developer CLI options, not model tool parameters.

Metrics use exact section **and** document IDs: Recall@1, @3, @5 and truncated MRR@15 over 80 answerable questions. The 16 ambiguous/unsupported/live/follow-up cases are separately scripted through the real engine. English, Dari, Pashto, category, module and principal breakdowns and every candidate/no-hit are retained. Same-document/wrong-section candidates do not count as supporting sections.

Performance includes uncached load, cached snapshot checks, warm search, materialization, validated dispatch, mock orchestration, real authorized history/API persistence, query counts and separate `tracemalloc` allocations. No timing is labeled real DeepSeek latency. Run benchmarks without unrelated CPU-heavy work; N=10 tails are descriptive and include cold first-use samples.

Artifacts:

- [Initial assessment](initial_assessment.md): inspected implementation and pre-measurement gaps.
- [Questions](questions.jsonl), [config](config.json): fixed annotations and reproducible settings.
- [Baseline](baseline.json), [final](results.json): actual candidate rankings, test statuses, measurements and comparisons.
- [Failure analysis](failure_analysis.json): all 41 baseline/final low-ranked targets, remaining failures and regressions.
- [Evaluation report](evaluation_report.md): measured gains, security/control-flow coverage and unresolved limits.
- [Live review checklist](live_review_checklist.md): optional later human assessment, not executed by offline evaluation.

The broader `python manage.py test ai_assistant knowledge` suite includes the evaluator's own dataset/metric/cache tests. The complete backend suite retains the two independently reproduced order timestamp failures described in the report. No production data or database schema is changed by this evaluator.
