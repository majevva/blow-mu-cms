Task statement
- Migrate BastionMU runtime-management capabilities into `blow-mu-cms`, with a clear role split: `SUPER_ADMIN` gets the full operational/admin surface currently living in the Blazor panel, while `GAME_MASTER` keeps the narrower live-moderation and GM workflow inside the CMS.

Desired outcome
- The CMS becomes the primary control surface for BastionMU operations.
- `GAME_MASTER` gets a focused GM console for live moderation and game-facing actions.
- `SUPER_ADMIN` gets a CMS-native control center that progressively replaces the Blazor admin/runtime-management panel.
- Legacy Blazor modules are migrated in deliberate slices without mixing runtime ops, content ops, and GM workflows into one flat admin page.

Known facts/evidence
- The CMS already has a first native admin slice and now distinguishes `/gm` and `/superadmin` routing plus a shared role model with `SUPER_ADMIN`.
- BastionMU's actual web-admin surface includes runtime/server operations, logged-in account management, generic config editing, plugins, logs, setup, and live map tooling.
- The BastionMU UI is not a pure GM console; many deeper capabilities are infrastructure/runtime-management features that the CMS does not yet own.
- Existing legacy routes confirmed from BastionMU include `/servers`, `/logged-in`, `/setup`, `/config-updates`, `/plugins`, `/logfiles`, `/users`, `/accounts`, `/edit-account/...`, and live map pages under `/gameServer/...`.
- Previous architect analysis concluded the current safe shipped slice is `Accounts + Online/Kick + Broadcast + server stats + explicit legacy handoff`, and that full parity requires a dedicated runtime-management boundary in CMS.

Constraints
- Ralph planning gate is active: implementation must wait until PRD + test spec artifacts exist.
- No new dependencies.
- Respect existing React + Spring Boot + current CMS UI patterns.
- Must keep role separation explicit: no accidental widening of GM permissions to superadmin-only runtime tools.
- Migration should proceed in reviewable slices with verification gates, not one giant rewrite.

Unknowns/open questions
- What the correct migration order is for the full runtime-management surface so the CMS gains real ownership without destabilizing production.
- Which BastionMU modules should be reimplemented as native CMS modules first versus temporarily bridged via legacy routes.
- Which backend abstractions are needed in Spring to safely own runtime/server lifecycle behavior that currently belongs to the Blazor/OpenMU runtime surface.

Likely codebase touchpoints
- `client/src/pages/Admin/Admin.tsx`
- `client/src/pages/SuperAdmin/SuperAdmin.tsx`
- `client/src/auth/authorization.ts`
- `client/src/App.tsx`
- `client/src/components/AccountCard/AccountCard.tsx`
- `client/src/components/Navbar/MobileNavigation/MobileAccountMenu.tsx`
- `client/src/i18n/locale/{pl,en,pt}.json`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/AccountService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/controllers/AdminController.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/enums/AccountState.java`
- `/home/openclawops/services/BastionMU/src/Web/AdminPanel/**`
- `/home/openclawops/services/BastionMU/src/Web/Map/**`
- `/home/openclawops/services/BastionMU/src/Web/Shared/Services/**`
