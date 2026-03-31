# Implementation Plan: BastionMU Admin Integration

1. Backend admin API surface
- Add missing DTOs for teleport, guild-master transfer, and broadcast message payloads.
- Extend repositories required for admin workflows:
  - `GameMapDefinitionRepository`
  - case-insensitive guild lookup
  - guild-member query helpers for master transfer / disband
- Extend `AdminService` with:
  - character lookup
  - teleport
  - force reset
  - admin attribute update
  - guild lookup
  - guild disband
  - guild master transfer
  - broadcast
- Extend `GameServerService` with reusable admin-panel integration helpers for disconnect and broadcast delivery.
- Expose the new `/admin/**` endpoints in `AdminController`.

2. Backend tests
- Keep the existing kick tests.
- Add focused unit/controller coverage for new privileged operations and orchestration order.
- Avoid DB-bound integration tests in this workspace; keep tests repository-independent where possible.

3. Frontend admin data layer
- Extend `client/src/api/admin.ts` with queries and mutations for characters, guilds, teleport, force reset, attribute update, guild-master change, guild disband, and broadcast.
- Reuse `client/src/api/game-server.ts` for server list data where needed.
- Extend API error translation mapping for new backend error messages.

4. Frontend admin UX
- Refactor `client/src/pages/Admin/Admin.tsx` into a tabbed control center.
- Preserve the current accounts table.
- Keep the online table and improve action feedback/pending states.
- Add search-driven character and guild workspaces with focused forms/actions.
- Add a compact broadcast form with server targeting.
- Keep styling consistent with existing components and avoid adding a second admin visual language.

5. Verification
- Run backend unit tests.
- Run frontend build/typecheck.
- Fix failures until green.
- Run parallel architecture/security/quality validation before final reporting.
