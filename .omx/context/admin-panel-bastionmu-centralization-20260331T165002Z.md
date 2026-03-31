Task statement
- Integrate the BastionMU/OpenMU admin capabilities into `blow-mu-cms` so Game Masters can work from a centralized CMS admin area instead of relying on a separate admin subdomain.

Desired outcome
- `/admin` becomes a polished GM cockpit inside the CMS.
- Existing native admin features (account search/state changes) are preserved and improved.
- Online-player moderation is completed and production-ready.
- The CMS exposes a clear bridge to the full BastionMU admin panel capabilities on the same domain/path when available, so the GM retains parity with the current subdomain workflow without forcing a full rewrite in one step.
- Changes are covered by backend tests and frontend build verification.

Known facts/evidence
- Earlier commits already added `/admin` routing and account management in CMS: `efdea09 feat: integrate admin panel into CMS with role-based access`.
- The current working tree already contains an unfinished first migration slice for online-player kick across backend, frontend, i18n, and tests.
- `ADMIN_MIGRATION.md` documents a phased migration roadmap, but only the first slice is partially implemented.
- `deploy/bastion-integration/docker-compose.yml` already wires CMS to BastionMU database/admin API, so the repos are operationally connected.
- Local repo `/home/openclawops/services/BastionMU` exists and shows the legacy admin surface: accounts, logged-in accounts with disconnect, live map, and generic admin/config pages.
- BastionMU deployment history includes `/panel` same-domain fallback support (`ed8e1474 feat(routing): add /panel path fallback while panel subdomain propagates`), which is a viable centralization bridge.
- The native CMS admin currently lacks a structured multi-view cockpit and does not yet provide parity access to the full BastionMU panel.

Constraints
- No new dependencies.
- Respect existing tech stack and UI patterns in the CMS.
- Avoid duplicating previous work; refine and complete the current changes instead.
- Keep behavior safe and reversible; do not break current admin/account flows.
- Validate with tests/builds before claiming completion.

Unknowns/open questions
- Whether the deployed BastionMU panel is always available under `/panel` in every environment, or only in the BastionMU stack with matching Traefik config.
- Whether iframe embedding is safe/reliable for the legacy panel, or whether same-tab navigation is the more robust bridge.
- Which subset of legacy GM functions should be reimplemented natively now versus linked through the bridge for parity.

Likely codebase touchpoints
- `client/src/pages/Admin/Admin.tsx`
- `client/src/api/admin.ts`
- `client/src/api/game-server.ts`
- `client/src/App.tsx`
- `client/src/components/AccountCard/AccountCard.tsx`
- `client/src/components/Navbar/MobileNavigation/MobileAccountMenu.tsx`
- `client/src/i18n/locale/{pl,en,pt}.json`
- `client/src/i18n/get-api-error-message.ts`
- `server/src/main/java/io/github/felipeemerson/openmuapi/controllers/AdminController.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/AdminService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/services/GameServerService.java`
- `server/src/main/java/io/github/felipeemerson/openmuapi/configuration/SystemConstants.java`
- `server/src/test/java/io/github/felipeemerson/openmuapi/controllers/AdminControllerTest.java`
- `server/src/test/java/io/github/felipeemerson/openmuapi/services/AdminServiceTest.java`
