# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Never let `main.ts` write `config.yaml` without a `whitelist` key: route96 treats a missing key as open uploads, which is why an empty list is written as a sentinel.
- Every key the package writes to `config.yaml` must be one upstream's `should_skip` (`src/db_config.rs`) keeps out of its database `config` table. A seeded key is shadowed by its first-run value forever, so a new managed key, or an upstream bump that stops skipping one, needs that row deleted before route96 starts.
