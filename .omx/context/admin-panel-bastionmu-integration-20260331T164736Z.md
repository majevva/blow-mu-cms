Task statement
- Integrate BastionMU/OpenMU admin-panel capabilities into `blow-mu-cms` so game masters can manage the game from the CMS instead of using the current admin subdomain.

Desired outcome
- A centralized CMS admin experience which covers the practical GM workflows currently available in the BastionMU admin panel, implemented natively in the existing tech stack and aligned with the repo UI/UX patterns.

Known facts / evidence
- `efdea09 feat: integrate admin panel into CMS with role-based access` already added `/admin`, account search, pagination, and state changes.
- Current uncommitted changes add the first migrated action: kick online player, including frontend UI, backend endpoint, integration client, and tests.
- `ADMIN_MIGRATION.md` documents a broader migration path: kick, teleport, force reset, admin attribute editing, guild management, and broadcast tooling.
- `/home/openclawops/services/BastionMU` exists locally and can be used as the source of truth for existing admin-panel capabilities and integration contracts.

Constraints
- Do not duplicate previous work; build on existing commits and local modifications.
- No new dependencies without explicit request.
- Keep diffs small, reviewable, and reversible.
- Must run lint/typecheck/tests/static analysis after changes.
- Final result should feel professional and consistent with current UI/UX patterns.

Unknowns / open questions
- Which BastionMU admin actions are currently exposed by stable APIs suitable for CMS consumption.
- Whether all desired GM actions can be migrated in one pass without adding risky backend abstractions.
- Whether current uncommitted changes fully align with `ADMIN_MIGRATION.md` or need hardening/refactor.

Likely codebase touchpoints
- `client/src/pages/Admin/Admin.tsx`
- `client/src/api/admin.ts`
- `client/src/api/game-server.ts`
- `client/src/i18n/locale/*.json`
- `server/src/main/java/io/github/felipeemerson/openmuapi/controllers/AdminController.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
- `server/src/test/java/io/github/felipeemerson/openmuapi/**`
- `/home/openclawops/services/BastionMU/**` for capability and contract comparison
