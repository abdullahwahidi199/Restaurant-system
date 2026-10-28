# Optional future live-model review

The offline evaluation does **not** certify DeepSeek's tool choices, factual accuracy, multilingual fluency or injection resistance at the model level. No second LLM judge is used. The following is an optional human acceptance procedure, not an instruction executed during Task 5.

1. Use an authorized test account and synthetic conversations in a development environment. Apply existing assistant migrations and build/validate the private index. Verify the account's actual role and active branch; the CLI has no unrestricted fake-user or role override.
2. Supply `DEEPSEEK_API_KEY` through server secret management. Keep thinking disabled as implemented. Do not put credentials in a question, source document, frontend payload or review artifact.
3. Explicitly invoke the existing live path only when live testing is authorized:

   ```powershell
   python manage.py test_ai_assistant --live --user-id <authorized-test-account-id> --question "How do I record a contractor payment?"
   ```

   Use `--conversation-id` for a follow-up. The offline `evaluate_ai_assistant` command has no live-provider mode.

4. Review representative cases from the frozen dataset: concrete procedures, multi-step workflows, all four payment ambiguity cases, unsupported requests, live-data boundaries, permission differences, follow-ups, and English/Dari/Pashto questions. Include the remaining strict retrieval misses EVAL-010, EVAL-060 and EVAL-061. Native cases EVAL-065–078 target English-only procedure text; model-generated English topics may help, but raw lexical recall does not prove that translation is reliable.
5. For each final answer, compare every operational claim against the fetched cited section—not just its document title. Check exact navigation routes, visible labels, prerequisites, required versus optional fields, defaults, numeric/date rules, UI/backend differences, state transitions, side effects, role/branch limits, irreversible changes and recovery warnings. A citation alone is not proof of entailment.
6. Confirm source IDs resolve to current authorized sections and that document title/heading/status match. An unrelated fetched section or a source not fetched by that conversation is a failure. Search summaries and capability labels cannot independently support instructions.
7. Check that payment domains remain distinct, vague questions trigger clarification, unavailable controls are not invented, and absence of retrieval is expressed as uncertainty rather than proof that a feature cannot exist. Verify the assistant never fabricates current sales, balances or records.
8. Verify Dari/Pashto meaning, grammar and correct retention of actual English interface labels with a fluent reviewer. Do not accept an invented localized button. Record missing translation/documentation as a gap rather than changing expectations to match the answer.
9. Test malicious user, document and historical text. Backend tests already establish allowlisting/authorization/non-execution; a human must additionally reject answers that obey embedded instructions, reveal internal material or recommend unsupported/unsafe operator actions. Do not execute suggested SQL, shell commands or business mutations during this documentation review.
10. Record pass/fail and concise reasons per question, model/version, date, language, test-role profile, index version and verified source IDs. Store only approved synthetic final answers/source metadata. Exclude API/JWT/discovery tokens, private customer data, provider reasoning and full internal prompts.
11. Measure real provider latency, cost and reliability separately from the local mock timings. Review synchronous worker/proxy timeouts and shared throttle-cache behavior in the actual deployment. Do not relabel mock latency as live response time.

Release acceptance should require factual support for all procedural claims, correct permission behavior, no fabricated live data, appropriate uncertainty and a fluent multilingual review. Retain failures and revise the implementation or a versioned dataset transparently; do not rewrite the frozen baseline to hide them.
