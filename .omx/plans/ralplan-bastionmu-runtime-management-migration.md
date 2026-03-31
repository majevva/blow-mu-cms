# BastionMU Runtime-Management Migration Consensus Plan

## Requirements Summary

- Move BastionMU runtime-management ownership into `blow-mu-cms` in deliberate slices, not as a flat admin dump.
- Preserve explicit role split:
  - `SUPER_ADMIN`: full operational/admin surface currently living in BastionMU Blazor.
  - `GAME_MASTER`: focused GM console for live moderation and game-facing actions only.
- Respect the active Ralph gate: no implementation until both `prd-*.md` and `test-spec-*.md` exist.
- Reuse existing CMS stack and patterns: React client, Spring Boot server, current auth/role model, no new dependencies.
- Keep current shipped GM slice stable while CMS progressively absorbs BastionMU routes now confirmed in legacy:
  - `/servers`
  - `/logged-in`
  - `/accounts`
  - `/edit-account/...`
  - `/setup`
  - `/config-updates`
  - `/plugins`
  - `/logfiles`
  - `/users`
  - `/gameServer/*` live map routes

## Acceptance Criteria

- A PRD exists which defines target IA, role boundaries, migration slices, temporary legacy handoff rules, and explicit non-goals.
- A test spec exists which covers authorization, backend service/controller behavior, client routing, UI visibility, and legacy handoff behavior.
- The planned target state keeps `GAME_MASTER` limited to GM actions and prevents access to `SUPER_ADMIN` runtime modules by route, API, and UI affordances.
- The plan establishes a CMS-native runtime-management boundary instead of scattering BastionMU parity work across the existing GM page.
- Each migration slice has a bounded deliverable, rollback boundary, and verification gate.
- Legacy BastionMU remains the fallback only for modules not yet migrated, with visible handoff points until native ownership is complete.

## Recommended Migration Slices And Ordering

1. Foundation and contract slice
   - Define PRD, test spec, information architecture, permission matrix, and legacy handoff policy before feature work.
2. Runtime control center slice
   - Superadmin-only server lifecycle, runtime summaries, and operational entry points replacing the current legacy card list.
3. Logged-in/session operations slice
   - Superadmin operational session/account controls from `/logged-in`, keeping GM-only live moderation separate.
4. Account/admin user management slice
   - Superadmin account administration from `/accounts`, `/edit-account/...`, and `/users`.
5. Configuration and setup slice
   - `/setup` and `/config-updates`, then generic config-editing abstractions needed for safe CMS ownership.
6. Plugins and observability slice
   - `/plugins` and `/logfiles`, after authorization and runtime boundaries are proven.
7. Live map slice
   - `/gameServer/*` live map routes last, because they are the heaviest specialized surface and should not block earlier ownership wins.

Rationale:
- This order moves from boundary-setting and low-ambiguity operational ownership to heavier configuration and visualization modules.
- It keeps the current GM console stable while shifting superadmin runtime ownership first.
- It defers the most coupled and specialized module, live map, until the runtime API boundary is mature.

## Implementation Steps

1. Author planning artifacts and migration contract.
   - Create `/.omx/plans/prd-bastionmu-runtime-management-migration.md`.
   - Create `/.omx/plans/test-spec-bastionmu-runtime-management-migration.md`.
   - Ground them in:
     - `/home/openclawops/services/blow-mu-cms/.omx/context/bastionmu-runtime-management-migration-20260331T172656Z.md`
     - `/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx`
     - `/home/openclawops/services/blow-mu-cms/client/src/App.tsx`
     - `/home/openclawops/services/blow-mu-cms/client/src/auth/authorization.ts`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
   - Acceptance check:
     - PRD defines role matrix, route ownership, target nav, slice boundaries, and temporary legacy bridges.
     - Test spec enumerates API, UI, auth, and regression coverage per slice.

2. Separate GM console from superadmin runtime shell at the architecture level.
   - Refine target ownership around:
     - `/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx`
     - `/home/openclawops/services/blow-mu-cms/client/src/pages/SuperAdmin/SuperAdmin.tsx`
     - `/home/openclawops/services/blow-mu-cms/client/src/components/Navbar/MobileNavigation/MobileAccountMenu.tsx`
     - `/home/openclawops/services/blow-mu-cms/client/src/i18n/locale/en.json`
     - `/home/openclawops/services/blow-mu-cms/client/src/i18n/locale/pl.json`
     - `/home/openclawops/services/blow-mu-cms/client/src/i18n/locale/pt.json`
   - Planned outcome:
     - `/gm` becomes a focused moderation console.
     - `/superadmin` becomes the operational/admin entry point for runtime ownership and migration status.
   - Acceptance check:
     - No planned superadmin runtime module lives only inside the GM page/tab structure.

3. Define the server-side runtime-management boundary before parity work.
   - Plan service/controller seams around:
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/controllers/AdminController.java`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/controllers/GameServerController.java`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
     - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/enums/AccountState.java`
   - Recommendation:
     - Keep GM moderation endpoints under the admin/GM surface.
     - Introduce a superadmin-oriented runtime-management service/controller boundary for lifecycle, setup, config, plugins, logs, and operator-user management.
   - Acceptance check:
     - Planned API ownership mirrors role split and does not rely on shared catch-all admin privileges.

4. Migrate runtime control center first.
   - Source modules:
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Servers.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/API/ServerController.cs`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/LoggedIn.razor`
   - CMS targets:
     - superadmin route shell in `/home/openclawops/services/blow-mu-cms/client/src/pages/SuperAdmin/SuperAdmin.tsx`
     - runtime APIs in `server/src/main/java/.../controllers` and `.../services`
     - client hooks in `/home/openclawops/services/blow-mu-cms/client/src/api/admin.ts` or a new runtime-focused API module
   - Acceptance check:
     - Planned first implementation slice gives CMS native ownership of runtime visibility and core server/session actions without changing GM scope.

5. Migrate superadmin administration modules next.
   - Source modules:
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Accounts.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/EditAccount.razor.cs`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/AdminUsers.razor`
   - CMS targets:
     - existing account admin surface in `/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx`
     - role checks in `/home/openclawops/services/blow-mu-cms/client/src/auth/authorization.ts`
     - tests in:
       - `/home/openclawops/services/blow-mu-cms/server/src/test/java/io/github/felipeemerson/openmuapi/controllers/AdminControllerTest.java`
       - `/home/openclawops/services/blow-mu-cms/server/src/test/java/io/github/felipeemerson/openmuapi/services/AdminServiceTest.java`
   - Acceptance check:
     - Admin account state changes, operator-user management, and deeper account editing are explicitly superadmin-owned unless a PRD exception states otherwise.

6. Migrate config/setup, then plugins/logs, then live map.
   - Source modules:
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Setup.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Updates.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/Plugins.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/LogFiles.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/GameServer.razor`
     - `/home/openclawops/services/BastionMU/src/Web/AdminPanel/Pages/MapPage.razor`
     - `/home/openclawops/services/BastionMU/src/Web/Map/Map/MapController.cs`
   - Recommendation:
     - Treat setup/config as high-risk operational ownership requiring stricter PRD + test-spec detail.
     - Treat live map as the final specialized slice, potentially starting with bridge/embed/handoff before full native rebuild.
   - Acceptance check:
     - Each late-stage slice has explicit rollback/handoff rules and does not widen GM permissions.

## Risks And Mitigations

- Risk: GM and superadmin concerns stay entangled because the current CMS surface is one shared admin component.
  - Mitigation: make the PRD require separate IA, separate route ownership, and separate endpoint permissions before new feature delivery.
- Risk: Recreating BastionMU parity on top of current `AdminService` causes a catch-all privilege model.
  - Mitigation: define a dedicated runtime-management boundary and superadmin authorization checks before migrating setup/config/logs/plugins.
- Risk: Live map scope dominates the migration and delays ownership of simpler runtime modules.
  - Mitigation: move live map to the last slice and permit temporary legacy handoff until runtime/service boundaries are stable.
- Risk: Existing CMS tests cover only the current GM-safe slice.
  - Mitigation: require test-spec expansion before implementation and add slice-by-slice regression gates.
- Risk: Setup/config migration can destabilize production behavior if generic config editing is copied blindly.
  - Mitigation: treat setup/config as separate slices after server/runtime contracts are proven, with stricter review and rollback criteria.

## Verification Steps

- Verify PRD and test-spec artifacts exist before any implementation tool or executor handoff.
- Verify role matrix consistency across:
  - `/home/openclawops/services/blow-mu-cms/client/src/auth/authorization.ts`
  - `/home/openclawops/services/blow-mu-cms/server/src/main/java/io/github/felipeemerson/openmuapi/enums/AccountState.java`
- Verify planned route ownership across:
  - `/home/openclawops/services/blow-mu-cms/client/src/App.tsx`
  - `/home/openclawops/services/blow-mu-cms/client/src/pages/Admin/Admin.tsx`
  - `/home/openclawops/services/blow-mu-cms/client/src/pages/SuperAdmin/SuperAdmin.tsx`
- Verify current regression baseline and planned extensions in:
  - `/home/openclawops/services/blow-mu-cms/server/src/test/java/io/github/felipeemerson/openmuapi/controllers/AdminControllerTest.java`
  - `/home/openclawops/services/blow-mu-cms/server/src/test/java/io/github/felipeemerson/openmuapi/services/AdminServiceTest.java`
- Verify each slice maps to concrete BastionMU source modules before execution starts.

## RALPLAN-DR Summary

### Principles

- Preserve strict role boundaries by default.
- Migrate in reviewable slices with rollback boundaries.
- Prefer native CMS ownership over permanent legacy embedding.
- Keep the existing GM-safe slice stable while superadmin runtime ownership expands.
- Ground every migration slice in explicit test coverage and verification gates.

### Decision Drivers

- Production safety while moving operational/runtime capabilities.
- Permission correctness between `GAME_MASTER` and `SUPER_ADMIN`.
- Fastest path to real CMS ownership without forcing a giant rewrite.

### Viable Options

- Option A: Expand the current shared admin page until it reaches parity.
  - Invalidated because it preserves role entanglement and encourages catch-all permissions.
- Option B: Build a dedicated superadmin runtime-management surface in CMS while keeping a focused GM console.
  - Preferred because it matches the desired role split and supports slice-based migration.
- Option C: Keep BastionMU as the permanent operational back office and only polish bridges in CMS.
  - Rejected because it does not achieve the desired outcome of CMS primary ownership.

## ADR

### Decision

- Adopt a dual-surface CMS migration: `SUPER_ADMIN` owns a dedicated runtime-management control center in `blow-mu-cms`, while `GAME_MASTER` remains limited to a focused moderation console. Migrate BastionMU modules in ordered slices, with PRD and test-spec completion as the execution gate.

### Drivers

- Clear permission and workflow separation.
- Lower migration risk through bounded slices.
- Need for CMS-native ownership instead of indefinite legacy dependence.

### Alternatives Considered

- Keep one shared admin page with role-based tab hiding.
- Continue using BastionMU for most runtime operations and only add links from CMS.
- Migrate live map and advanced config first to chase parity quickly.

### Why Chosen

- A separate superadmin surface matches the confirmed BastionMU scope and avoids widening GM permissions.
- Ordered slices let the team deliver operational ownership early without blocking on the heaviest modules.
- PRD/test-spec gating prevents implementation from drifting before requirements and coverage are explicit.

### Consequences

- Some existing shared-admin code will likely be split or reorganized.
- More explicit authorization seams are required in Spring and React.
- Legacy BastionMU will remain temporarily in the flow until later slices complete.

### Follow-ups

- Write PRD artifact.
- Write test-spec artifact.
- Confirm whether live map first ships as link, embed, or native rebuild phase 1.
- Confirm whether config editing gets a generic CMS abstraction or narrower task-specific modules first.

## Available-Agent-Types Roster

- `planner`: finalize PRD/test-spec sequencing and migration plan updates.
- `architect`: define runtime-management boundaries, IA, and API ownership.
- `analyst`: tighten acceptance criteria and permission matrix.
- `executor`: implement each approved migration slice after the Ralph gate opens.
- `debugger`: isolate runtime/API integration issues during BastionMU-to-CMS cutover.
- `test-engineer`: author regression and authorization coverage from the test spec.
- `verifier`: validate completion evidence per slice.
- `critic`: challenge permission drift, coupling, and rollout assumptions.
- `researcher`: inspect BastionMU source modules and document source-to-target parity.

## Follow-Up Staffing Guidance

### Ralph Path

- Use `planner` first to produce:
  - `prd-bastionmu-runtime-management-migration.md`
  - `test-spec-bastionmu-runtime-management-migration.md`
- Then use `architect` to lock:
  - superadmin vs GM IA
  - Spring service/controller split
  - slice 1 deliverable boundary
- Then hand slice execution to `executor`, with `test-engineer` and `verifier` attached on every slice.

### Team Path

- Suggested staffing:
  - Lane 1: `architect` for IA, boundaries, and ADR refinements.
  - Lane 2: `researcher` for BastionMU source parity mapping.
  - Lane 3: `test-engineer` for authorization and regression spec.
  - Lane 4: `executor` for implementation once the Ralph gate is cleared.
  - Lane 5: `verifier` for slice-exit evidence.
- Suggested reasoning levels:
  - `architect`: high
  - `researcher`: high
  - `test-engineer`: medium
  - `executor`: high
  - `verifier`: high

## Launch Hints

- Start with PRD and test-spec only; do not open implementation lanes before both files exist.
- First execution slice should target superadmin runtime control center ownership, not live map or generic config editing.
- Reuse existing CMS account/admin patterns where they already align, but do not force all runtime features through the current monolithic admin page.
- Treat live map as a later milestone with an explicit phase-1 strategy: bridge, embed, or native rebuild.

## Team Verification Path

1. Verify Ralph gate artifacts exist:
   - `/.omx/plans/prd-bastionmu-runtime-management-migration.md`
   - `/.omx/plans/test-spec-bastionmu-runtime-management-migration.md`
2. Verify permission matrix is consistent across client, server, and planned routes.
3. Verify slice scope against BastionMU source files before implementation starts.
4. Verify tests are added for route guards, API authorization, and migrated behavior before legacy handoff is removed.
5. Verify each slice exits with:
   - native CMS ownership for the targeted module
   - explicit rollback path
   - legacy handoff updated only for remaining modules

