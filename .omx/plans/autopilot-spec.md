# Autopilot Spec: BastionMU Admin Integration

## Goal
Turn `blow-mu-cms` into the central game-master workspace so admins no longer need the separate BastionMU/OpenMU admin subdomain for day-to-day operational tasks.

## Scope
- Preserve and harden the existing `/admin` account-management flow.
- Complete the online-player action slice by integrating real disconnects from the game server.
- Add a native admin character workspace in CMS for lookup plus high-value actions:
  - inspect character details
  - teleport a character
  - force-reset a character
  - update character attributes as admin
- Add a native admin guild workspace in CMS for lookup plus high-value actions:
  - inspect guild details
  - transfer guild master role
  - disband a guild
- Add a native broadcast workspace in CMS to send GM messages to one server or all servers.
- Polish the `/admin` UI into a clear, tabbed, production-ready control surface aligned with the current design system.
- Add regression tests for newly introduced backend admin behavior.

## Out of scope
- Porting BastionMU generic configuration editors, server boot/shutdown controls, live logs, or map visualization.
- Reproducing the full technical Blazor admin panel 1:1.
- Introducing new dependencies or a separate admin frontend.

## Functional requirements
1. Only `GAME_MASTER` and `GAME_MASTER_INVISIBLE` accounts can use admin actions.
2. Existing account search/pagination/state-change behavior must continue to work.
3. Online players must be visible in CMS and support disconnect directly from the game server integration.
4. Admins must be able to look up any character by name and see the data needed for operations.
5. Character admin actions must work without ownership checks; reset must bypass standard player constraints.
6. Admins must be able to look up any guild by name, inspect its members, change the guild master, and disband the guild.
7. Admins must be able to send a broadcast message to one server or all configured servers from CMS.
8. User feedback must flow through the existing toast + translated API error mapping.

## Design choices
- Use a single tabbed `/admin` page instead of many new routes to keep the CMS centralized and reduce navigation overhead for GMs.
- Reuse existing public data models and services where practical, but keep privileged mutations under `/admin`.
- Prioritize operational GM workflows over low-level server configuration screens from the BastionMU panel.

## Acceptance criteria
- `/admin` exposes coherent tabs for accounts, online players, characters, guilds, and broadcast.
- Admins can disconnect an online player from the CMS and see the list refresh.
- Admins can search a character, teleport it, force reset it, and update attributes from the CMS.
- Admins can search a guild, transfer guild master, and disband the guild from the CMS.
- Admins can send a message to a selected server or all servers from the CMS.
- Backend unit/controller tests cover the new admin behavior that is repository-independent.
- Frontend build/typecheck succeeds and backend tests succeed.
