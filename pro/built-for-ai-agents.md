# Built for AI Agents

## Friction

Most “agent” demos work *once* in a clean environment.

In production, the failures are boring:
- inputs aren’t where you expect
- tools flake
- runs time out
- retries are ad-hoc
- nobody can explain what happened after the fact

If you can’t measure completion + latency + retries, you can’t improve reliability.

## Bridge

AppleHealthData is **agent-native** by design:

1) **Deterministic I/O contracts**
   - Request/response JSON Schemas for the core workflows
   - Normalized error taxonomy (retryable vs fatal)

2) **Reproducible run artifacts**
   - Every run emits machine-readable artifacts (JSON/JSONL)
   - Artifacts list is explicit (no guessing)

3) **Benchmark harness**
   - A simple JSONL logging format
   - A scorecard template for completion rate + P50/P95 latency + retries

## Outcome

You get an agent workflow that’s not just “smart” — it’s **operational**.

- Fewer silent failures
- Faster recovery when something breaks
- A measurable path to higher completion rates

## Benchmark proof (placeholders)

We publish:
- completion rate: **__%**
- P50 latency: **__s**
- P95 latency: **__s**
- mean retries: **__**

Methodology: see `docs/benchmark-method.md`.

## CTA

- Try the workflow: **Apple Health Export Validator** (start with a real file)
- Read the contracts: `docs/io-spec.md`, `schemas/*.json`

### Events

See `events/cta-events.schema.json` for the analytics event contract.
