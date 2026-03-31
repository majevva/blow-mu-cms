# Test Spec: BastionMU Runtime Management Migration

## Scope

Verification strategy for migrating BastionMU runtime-management into `blow-mu-cms` under a role split:

- `GAME_MASTER`
- `SUPER_ADMIN`

This spec is written to govern slice-by-slice execution, starting with the first runtime-management slice after the current role foundation.

## Test Strategy

### Unit

1. Role helper tests
- `SUPER_ADMIN` passes GM access checks
- `GAME_MASTER` fails superadmin-only checks
- content-management and runtime-management permissions stay distinct

2. Admin/runtime service tests
- active session list mapping
- disconnect session/account actions
- denied access for non-superadmin
- regression for current GM actions still passing

3. Controller tests
- correct privilege check order
- expected HTTP status codes
- success path and forbidden path

### Integration

1. CMS backend -> BastionMU runtime bridge
- active sessions retrieval
- disconnect account/session behavior
- server list retrieval where applicable

2. Route partitioning
- `/gm` accessible to GM and superadmin where intended
- `/superadmin` accessible only to superadmin
- `/admin` redirects correctly by role

### End-to-End / UI

1. Signed-in `GAME_MASTER`
- sees GM entry point
- does not see superadmin modules
- can still use live moderation actions

2. Signed-in `SUPER_ADMIN`
- lands on superadmin control center
- sees module registry and migration status
- can navigate to migrated runtime-management modules

3. Legacy handoff integrity
- hybrid modules open the expected legacy destinations until replaced

### Observability / Safety

1. destructive actions require explicit UI initiation and backend authorization
2. denied access returns stable forbidden responses
3. no slice widens GM access by accident

## Acceptance Tests by Slice

### Slice 1: Role and shell foundation
- `SUPER_ADMIN` exists in frontend/backend role models
- `/admin` redirects correctly by role
- `/gm` and `/superadmin` render correctly
- superadmin shell displays module migration states

### Slice 2: Logged In Accounts runtime module
- CMS-native route exists under superadmin
- active sessions list renders login name + server id
- disconnect action works through CMS backend
- GM cannot access this module
- superadmin can access and execute action

### Slice 3: Account administration parity
- superadmin accounts list renders
- edit-account flow is reachable and role-gated
- content management privileges remain valid for both GM and superadmin where intended

### Slice 4: Server fleet control
- manageable servers list renders
- read-only state first
- start/stop/restart/remove actions are individually tested
- denied access path exists for non-superadmin

## Verification Commands

### Frontend
- `cd /home/openclawops/services/blow-mu-cms/client && npm run build`

### Backend
- `cd /home/openclawops/services/blow-mu-cms/server && ./mvnw -q test -DskipITs`

### Diagnostics
- run targeted diagnostics or compiler checks on changed files before claiming slice completion

## Regression Requirements

Every slice must re-verify:

1. current GM panel still builds and works
2. current broadcast and online moderation actions remain intact
3. role-gated content pages (`news`, `banners`) still behave correctly

## Failure Thresholds

Do not ship a slice if:

1. a non-superadmin can access a superadmin runtime module
2. a migrated module still depends on the legacy route for core behavior without being explicitly labeled hybrid
3. frontend build fails
4. backend tests fail
