Task statement
- Implement the first high-priority feature from ADMIN_MIGRATION.md in the native CMS admin panel.

Desired outcome
- Admins can kick an online character from the CMS admin UI.
- The action performs a real disconnect against the external admin panel API so the online list reflects the result.
- The change is covered by regression tests and basic frontend/backend verification.

Known facts/evidence
- `ADMIN_MIGRATION.md` marks "Kick gracza" as highest priority.
- Existing admin panel supports account search and account state changes at `/admin`.
- Existing public endpoint `/game/onlines` already returns detailed online character rows for the frontend.
- `GameServerService` already integrates with the external admin panel for online status, account-online checks, and server messages.
- There is no existing disconnect endpoint constant or kick flow in backend/frontend.
- Admin UI currently has no character detail subview; the least invasive UI anchor is a new online-characters section inside `client/src/pages/Admin/Admin.tsx`.

Constraints
- No new dependencies.
- Keep diffs small and reuse existing admin/game-server patterns.
- Must preserve current account-management behavior in admin panel.
- Must verify with tests/builds after changes.

Unknowns/open questions
- Exact external disconnect route is not implemented in repo; ADMIN_MIGRATION.md references `POST /admin/player/{name}/disconnect`.
- No dedicated local `.codex/prompts/*.md` role prompts are present, so execution will stay mostly direct unless delegation becomes clearly necessary.

Likely codebase touchpoints
- `server/src/main/java/io/github/felipeemerson/openmuapi/configuration/SystemConstants.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/controllers/AdminController.java`
- `server/src/test/java/io/github/felipeemerson/openmuapi/...`
- `client/src/api/admin.ts`
- `client/src/pages/Admin/Admin.tsx`
- `client/src/i18n/locale/{pl,en,pt}.json`
- `client/src/i18n/get-api-error-message.ts`
