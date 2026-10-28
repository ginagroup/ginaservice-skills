# GINA Skills Adaptation Roadmap

## Purpose

Turn the repository's useful skills, agent patterns, rules, and workflows into a coherent GINA-native system. The goal is not to enable or copy everything unchanged; it is to preserve useful ideas, adapt them to GINA's actual architecture, and verify the result.

## Operating principles

1. **Keep the idea; adapt the implementation.** Preserve useful reasoning and workflows, but replace assumptions tied to another harness, filesystem layout, model, tool, or runtime.
2. **No trust by presence.** A file in this repository is a candidate, not proof of correctness or safety.
3. **Least privilege by default.** Skills should request only the tools and access needed for their task. Destructive actions, network access, credential use, and persistent writes need explicit guardrails.
4. **Evidence over claims.** Distinguish static inspection, automated checks, and runtime tests. Never label a test passed unless it was actually run.
5. **Preserve provenance and license obligations.** Record upstream origin when known, retain required notices, and document material GINA changes.
6. **Small reversible changes.** Work on a review branch, make focused commits, and do not merge to `main` until the change and its verification are reviewed.
7. **Do not invent GINA infrastructure.** References to Redis, PostgreSQL, hooks, sandboxes, or audit sinks are design claims until the relevant implementation and configuration are verified.

## Adaptation workflow

### Stage 1 — Inventory and baseline

- Enumerate skills, rules, agents, commands, helper scripts, registries, trigger maps, and MCP configuration.
- Check that referenced paths exist and that generated catalogs agree with source files.
- Record a baseline with: item name, category, source/provenance, current harness assumptions, tools/permissions, dependencies, verification status, and disposition.
- Do not infer full coverage from summary counts alone.

### Stage 2 — Triage each candidate

Assign one disposition:

- **Adopt:** already fits GINA and passes review.
- **Adapt:** useful core idea, but needs GINA-specific changes.
- **Test:** promising but unverified or dependent on unavailable runtime behavior.
- **Replace:** better implemented with a simpler native rule, skill, or script.
- **Reject:** unsafe, redundant, incompatible, or not worth maintaining.

Prioritize by user value, security impact, frequency of use, maintenance burden, dependency risk, and testability.

### Stage 3 — Adapt to GINA

For each adopted or adapted item:

- Define its purpose, triggers, inputs, outputs, and failure behavior.
- Remove hard-coded paths and assumptions about a specific AI harness unless required and documented.
- Separate always-on deterministic constraints (rules) from on-demand workflows (skills).
- Prefer a local script/CLI for deterministic one-shot work; use MCP only when a reusable structured tool interface is justified.
- Validate untrusted content as data, not instructions.
- Avoid exposing secrets in source, logs, prompts, examples, or error messages.
- Make network access, file writes, process control, and external side effects explicit.
- Add a concise GINA-specific section explaining what changed and why.

### Stage 4 — Verification

Use the strongest available evidence and label it accurately:

- **Static:** file/path references, schema, metadata, permissions, dependency and secret-pattern checks.
- **Automated:** JSON/schema/lint/unit checks actually executed.
- **Runtime:** behavior tested in the intended harness and environment.
- **Not verified:** checks that could not be run because the runtime, dependencies, or permissions were unavailable.

A valid JSON file is not proof that a server launches; a well-written skill is not proof that its instructions work in production.

### Stage 5 — Release gate

Before merge:

- Review the diff and source/license notices.
- Check registry, trigger, and index consistency.
- Confirm no real credentials or private data were added.
- Document breaking changes, dependencies, and setup requirements.
- Require a second review for destructive operations, credential flows, or privileged tools.
- Keep unverified items out of the default/automatic execution path.

## Initial priorities

1. Registry and trigger consistency.
2. Security-related skills and tool-permission declarations.
3. MCP configurations: placeholders, fixed versions, paths, required environment variables, and optional integrations.
4. Skills that can modify files, run shell commands, access networks, manage memory, or launch autonomous loops.
5. Testing and evaluation skills that can verify the adapted behavior.
6. Remaining skills, grouped by domain and value.

## Audit record template

For each item, record:

- **Item / path:**
- **Disposition:** Adopt / Adapt / Test / Replace / Reject
- **Useful idea:**
- **GINA-specific mismatch:**
- **Security and permissions:**
- **Dependencies and provenance:**
- **Changes made:**
- **Verification performed:**
- **Remaining risks:**
- **Commit / review status:**

## Current status

This roadmap establishes the review method; it does not claim that all skills have been audited, adapted, activated, or runtime-tested. The current registry-path correction is on the review branch and has not been merged into `main`.
