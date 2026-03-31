# PRD: BastionMU Runtime Management Migration to CMS

## Requirements Summary

Migrate the BastionMU operational/admin surface from the Blazor panel into `blow-mu-cms` while preserving a strict role split:

- `GAME_MASTER`: focused live-operations console for player/game moderation
- `SUPER_ADMIN`: full runtime-management and back-office control surface

The migration must move the CMS from a hybrid bridge model to actual ownership of runtime-management workflows in reviewable slices, without collapsing all operations into one flat admin page.

## Goals

1. Make the CMS the primary operational entry point for BastionMU.
2. Preserve narrow GM permissions while expanding `SUPER_ADMIN` toward full BastionMU parity.
3. Replace legacy Blazor routes with CMS-native modules in a deliberate order.
4. Keep each migration slice testable, reversible, and production-safe.

## Non-Goals

1. One-shot rewrite of every BastionMU module in a single diff.
2. Copying the Blazor UI 1:1 without adapting it to CMS ownership boundaries.
3. Giving `GAME_MASTER` access to infrastructure/runtime lifecycle features.

## Users and Roles

### `GAME_MASTER`
- online player visibility
- disconnect / temporary ban / live moderation
- announcements/broadcast
- account-level moderation needed for GM workflow only if explicitly approved

### `SUPER_ADMIN`
- everything in `GAME_MASTER`
- account administration and editing
- logged-in account/runtime session control
- server lifecycle management
- setup/configuration updates
- plugin management
- logs and operational visibility
- panel-user management
- later: live map/native runtime views and deeper config editing

## Brownfield Facts and Evidence

### CMS today
- Native GM/admin slice already exists in [Admin.tsx](/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx).
- Runtime bridge endpoints already exist for online status, server stats, send-message, and disconnect via [GameServerService.java](/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java).
- Role model now includes `SUPER_ADMIN` in [AccountState.java](/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/enums/AccountState.java).

### BastionMU legacy panel
- Runtime/account session disconnect is exposed through `/logged-in` in [LoggedIn.razor](/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/LoggedIn.razor) and [LoggedInAccountService.cs](/home/openclawops/services/BastionMU/src/Web/Shared/Services/LoggedInAccountService.cs).
- Server lifecycle is exposed through `/servers` and [ServerItem.razor](/home/openclawops/services/BastionMU/src/Web/AdminPanel/Components/ServerItem.razor).
- Account editing is exposed through `/accounts` and `/edit-account/...` in [Accounts.razor](/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Accounts.razor) and [EditAccount.razor.cs](/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/EditAccount.razor.cs).
- Remaining superadmin modules include `/setup`, `/config-updates`, `/plugins`, `/logfiles`, `/users`, and live map pages.

## Product Principles

1. Role clarity over convenience.
2. CMS ownership over passive iframe cloning.
3. Thin bridges first, domain ownership second, UI polish throughout.
4. Reviewable slices over monolithic parity rewrites.
5. Verification evidence is required before each slice is considered migrated.

## Decision Drivers

1. Safety: avoid accidental privilege widening and risky runtime mutations.
2. Ownership: prefer CMS-native abstractions instead of permanent legacy deep-links.
3. Delivery: choose an order that unlocks useful parity quickly.

## Viable Options

### Option A: Full 1:1 UI clone immediately
- Pros: visible parity quickly
- Cons: high risk, weak ownership boundaries, large diff, poor verification surface

### Option B: Role-split staged migration with hybrid bridge
- Pros: safest route, aligns with CMS architecture, allows incremental parity
- Cons: hybrid state lasts longer, requires migration ledger and explicit handoff

### Option C: Keep Blazor for superadmin indefinitely, migrate only GM
- Pros: lowest immediate effort
- Cons: centralization goal fails, CMS never owns runtime-management

## Chosen Direction

Choose **Option B**: role-split staged migration with a temporary hybrid bridge and explicit module replacement plan.

## Scope Slices and Ordering

### Slice 1: Role and shell foundation
Status: in progress

- shared role helpers across backend/frontend
- `/admin` entry split into `/gm` and `/superadmin`
- superadmin landing shell with migration registry and legacy-module handoff
- keep current GM native functionality stable

### Slice 2: Online runtime sessions
First full runtime-management migration slice

- CMS-native `Logged In Accounts` module for `SUPER_ADMIN`
- list active accounts, server ids, disconnect account/session actions
- reuse existing runtime bridge concepts from BastionMU and current CMS game-server integration

### Slice 3: Account administration parity

- CMS-native account list for `SUPER_ADMIN`
- account details/editing surface modeled for CMS
- controlled state changes, account metadata, and content ownership hooks

### Slice 4: Server fleet control

- list manageable servers
- start/stop/restart/remove flows where ownership is safe
- move runtime lifecycle controls into explicit superadmin backend/controller/service boundary

### Slice 5: Operational modules

- setup
- configuration updates
- plugin management
- panel-user management
- logs overview

### Slice 6: Native live-map and advanced runtime tools

- gameServer map/live pages
- deeper runtime introspection
- remaining Blazor-only operational tooling

## Acceptance Criteria

1. `GAME_MASTER` cannot access superadmin-only runtime modules.
2. `SUPER_ADMIN` can access both the GM console and superadmin modules.
3. Each migrated BastionMU module has:
   - CMS-native route
   - backend ownership boundary
   - verification evidence
   - explicit removal or downgrade of its legacy dependency
4. The migration progresses by slices with zero ambiguity about which modules are:
   - native
   - hybrid
   - legacy-only
5. No slice ships without route-level and role-level verification.

## Implementation Steps

1. Stabilize the role shell and route split in:
   - [App.tsx](/home/openclawops/services/blow-mu-cms/client/src/App.tsx)
   - [Admin.tsx](/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx)
   - [authorization.ts](/home/openclawops/services/blow-mu-cms/client/src/auth/authorization.ts)
   - [AccountState.java](/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/enums/AccountState.java)

2. Implement **Slice 2** as the first true runtime-management replacement:
   - add CMS-native `Logged In Accounts` module and route under superadmin
   - create backend endpoint/service layer for active runtime sessions and disconnect action
   - mirror BastionMU behavior from [LoggedInAccountService.cs](/home/openclawops/services/BastionMU/src/Web/Shared/Services/LoggedInAccountService.cs)

3. Implement **Slice 3** account admin parity:
   - model a CMS-native superadmin accounts page beyond the current GM account moderation table
   - map what should remain GM-facing vs superadmin-only
   - add edit-account workflow equivalent to BastionMU `EditAccount`

4. Introduce explicit runtime-management backend boundary for **Slice 4**:
   - separate runtime/server-management responsibilities from current GM admin service
   - implement manageable server listing/actions with explicit superadmin gating

5. Migrate operational modules one by one:
   - setup
   - config updates
   - plugins
   - logs
   - panel users

6. Only after slices 2-5 stabilize, migrate live-map and advanced runtime tools.

## Risks and Mitigations

### Risk: privilege bleed between GM and SUPER_ADMIN
- Mitigation: central role helpers, route gating, backend privilege guards, regression tests

### Risk: CMS gains brittle runtime couplings
- Mitigation: introduce dedicated runtime-management services/controllers instead of growing `AdminService` indefinitely

### Risk: migration stalls in permanent hybrid mode
- Mitigation: keep explicit module registry with native/hybrid/legacy states and drive slices to replacement completion

### Risk: server lifecycle features are destructive
- Mitigation: implement read-first, guarded actions, confirmation UX, and narrow backend tests before enabling destructive operations

## Verification Steps

1. Backend unit tests for each new privilege boundary and runtime-management action.
2. Frontend build verification after each slice.
3. Route-level role verification for `GAME_MASTER` vs `SUPER_ADMIN`.
4. For runtime actions, verify both success path and denied-access path.
5. Keep migration ledger updated in superadmin UI so the actual state matches shipped functionality.

## RALPLAN-DR Summary

### Principles
- Separate GM operations from superadmin operations.
- Replace legacy modules in descending operational value order.
- Introduce CMS ownership boundaries before widening functionality.
- Prefer native modules to permanent legacy indirection.

### Decision Drivers
- privilege safety
- runtime ownership
- staged deliverability

### Options
- Option A: immediate 1:1 full rewrite
- Option B: staged role-split migration with hybrid bridge
- Option C: GM-only migration, keep superadmin in Blazor

## ADR

### Decision
Adopt staged role-split migration where the CMS becomes the operational front door for both `GAME_MASTER` and `SUPER_ADMIN`, but full runtime-management parity is delivered in ordered slices.

### Drivers
- role isolation
- runtime safety
- maintainable ownership model

### Alternatives Considered
- Immediate full 1:1 rewrite
- Permanent hybrid split with Blazor retained for superadmin

### Why Chosen
It is the only option that meets the centralization goal without turning the CMS into an unbounded, poorly verified rewrite.

### Consequences
- Requires deliberate planning and a migration ledger
- Delays full parity in favor of correctness and ownership
- Gives us a clear implementation roadmap for Ralph iterations

### Follow-ups
- Execute Slice 2 first
- Re-run architectural review after Slice 2 before enabling Slice 4 destructive controls

## Available-Agent-Types Roster

- `planner`
- `architect`
- `critic`
- `executor`
- `debugger`
- `test-engineer`
- `security-reviewer`
- `code-reviewer`
- `researcher`
- `writer`
- `verifier`

## Follow-up Staffing Guidance

### Ralph path
- Lane 1: `executor` for CMS routes/UI/backend slice implementation
- Lane 2: `test-engineer` or `verifier` for regression evidence and role-boundary tests
- Lane 3: `architect` for slice sign-off when moving into deeper runtime ownership

Suggested reasoning:
- implementation lane: high
- regression lane: medium
- sign-off lane: high

### Team path
- 1 frontend-heavy worker lane
- 1 backend/runtime-integration lane
- 1 verification lane
- architect sign-off at slice boundary

## Launch Hints

### Ralph
- `$ralph "implement slice 2 of /home/openclawops/services/blow-mu-cms/.omx/plans/prd-bastionmu-runtime-management.md --no-deslop"` for the first runtime-management migration slice

### Team
- `$team "implement slice 2 from /home/openclawops/services/blow-mu-cms/.omx/plans/prd-bastionmu-runtime-management.md with frontend, backend, and verification lanes"`

## Team Verification Path

1. Prove role gating for GM vs SUPER_ADMIN.
2. Prove CMS-native route/module replaces the targeted legacy path.
3. Prove runtime action success and denial paths.
4. Prove frontend build and backend tests remain green before team shutdown.
