# GINA Initial Security and Trigger Audit

**Review branch:** `audit/fix-registry-path`  
**Date:** 2026-10-28  
**Scope:** Static review of selected registry files and two skill documents. This is not a full repository audit and no runtime test suite was executed.

## Executive summary

- `INDEX.json` parses as JSON and declares 311 skills.
- `configs/skill-triggers@1.json` parses as JSON and contains 33 trigger entries.
- All 33 trigger IDs matched IDs in the index; no stale trigger IDs were found.
- The trigger map therefore covers 33/311 skills (10.6%). The file labels its model source as `hand-seeded` and `manual-curation-pending-regeneration`, so this may be an intentional curated subset rather than a defect. It must not be represented as full trigger coverage.
- The registry path fix previously made on this branch remains separate from `main`.
- The security-review skill contains a Solana wallet-signature example that should not be trusted as written.
- The agent-architecture-audit skill requests `Bash, Edit, Write` in its metadata. That is a broad permission set for an audit workflow and should be constrained by the consuming harness and task policy.

## Findings

### F-01 — Trigger map is a curated subset, not full coverage

**Evidence:** 311 skill IDs in `INDEX.json`; 33 trigger keys in `configs/skill-triggers@1.json`; all trigger keys match indexed skill IDs.

**Impact:** Skills outside the trigger map may not be discoverable through this trigger mechanism. This does not prove those skills cannot be invoked by other mechanisms.

**Recommendation:** Decide explicitly whether this file is intended to be a small hand-curated routing map or a complete generated map. If it is curated, rename/document the coverage semantics and avoid claiming all skills are trigger-routed. If it is intended to be complete, generate it from the index and validate that every intended skill has suitable triggers. Regenerate the digests as part of that process rather than hand-editing them.

**Disposition:** Needs architecture/product decision; no trigger entries added speculatively.

### F-02 — Solana signature verification example is unsafe/inaccurate

**Evidence:** `skills/security/security-review/SKILL.md` imports `verify` from `@solana/web3.js` and treats a base64-decoded public key as the verification key. Solana public keys are commonly represented in base58, and this import/verification pattern is not a reliable standard example for verifying a Solana wallet signature.

**Impact:** A developer could copy the example and implement wallet ownership verification incorrectly or with a non-existent API.

**Recommendation:** Replace the sample only after selecting and documenting the actual supported library and version (for example, Ed25519 verification with the appropriate Solana-compatible primitives), correct public-key/signature encodings, and a server-generated nonce/challenge bound to the intended domain, wallet, and expiry. Include replay-protection and signature-verification tests. Do not use a wallet signature alone as proof of authorization for unrelated actions.

**Disposition:** Security skill is **not approved for unqualified use** until this example is corrected and verified.

### F-03 — Transaction example is illustrative, not production-safe

**Evidence:** The same skill uses generic fields such as `transaction.to`, `transaction.amount`, `expectedRecipient`, and `getBalance` without defining the transaction format, token units, chain, finality, or authoritative on-chain verification.

**Impact:** Copying the sample directly may omit decimals/precision checks, network and mint validation, transaction status/finality checks, replay/idempotency controls, or authoritative account ownership checks.

**Recommendation:** Label this as pseudocode or replace it with a chain-specific verified flow. Validate the network, token/mint, recipient, raw integer amount and decimals, transaction signature, confirmed status/finality, and idempotency before crediting any balance.

**Disposition:** Requires a chain-specific implementation and tests before production use.

### F-04 — Broad tools in architecture-audit metadata

**Evidence:** `skills/architecture/agent-architecture-audit/SKILL.md` declares `Read, Grep, Glob, Bash, Edit, Write` as allowed tools.

**Impact:** An audit can become a modification workflow with shell execution and file-write capabilities. The metadata itself does not prove those permissions are enforced, but it creates a risk if a harness grants them automatically.

**Recommendation:** Prefer a read-only diagnostic pass by default. Require a separate explicit repair phase for shell execution or edits, with user approval for destructive actions and a diff review before committing.

**Disposition:** Adapt tool permissions to the actual GINA runtime; do not assume frontmatter is an enforcement boundary.

### F-05 — Security guidance includes commands that can modify dependencies

**Evidence:** The dependency section lists `npm audit fix` and `npm update` alongside inspection commands.

**Impact:** These commands can modify dependency versions and lockfiles. They should not be run automatically during an audit.

**Recommendation:** Separate read-only checks (`npm audit`, `npm outdated`) from mutating remediation commands. Require review of the diff and tests before applying changes.

**Disposition:** Documentation improvement recommended; no commands were executed.

## Validation performed

- Parsed `INDEX.json` and `configs/skill-triggers@1.json` as JSON through the repository connector.
- Compared all trigger IDs against indexed skill IDs.
- Read the relevant security-review and agent-architecture-audit skill documents from the review branch.
- Confirmed the source content and current blob IDs through subsequent reads.

## Not performed

- No repository-wide scan of all 311 skills.
- No shell, lint, unit, integration, or runtime tests.
- No launch of MCP servers or execution of helper scripts.
- No verification that GINA's claimed sandbox, DLP, memory, or audit infrastructure is actually deployed.
- No merge into `main`.

## Next actions

1. Keep the Solana-related security guidance marked as needing correction.
2. Determine whether trigger coverage is intentionally curated or meant to be generated for all skills.
3. Add a read-only-first permission policy for audit skills and separate it from repair execution.
4. Continue review of security and architecture skills before expanding to the rest of the inventory.
