# Admin Panel Migration Guide

Dokumentacja jak przenieść kolejne funkcje z `panel.blowmu.online` (OpenMU Blazor) do natywnego panelu admina w CMS.

## Co zostało już zrobione

- **Zarządzanie kontami** — lista kont z paginacją, wyszukiwanie po loginie, zmiana stanu konta (ban/GM/normal/itp.)
- Widoczne w CMS pod `/admin` dla graczy z rolą `GAME_MASTER` lub `GAME_MASTER_INVISIBLE`

---

## Architektura — jak dodać nową funkcję

Każda nowa funkcja wymaga 4 kroków:

```
1. Backend DTO      →  server/src/main/java/.../dto/
2. Backend Service  →  server/src/main/java/.../services/AdminService.java
3. Backend Controller → server/src/main/java/.../controllers/AdminController.java
4. Frontend hook    →  client/src/api/admin.ts
5. Frontend UI      →  client/src/pages/Admin/Admin.tsx (lub nowa strona)
6. i18n             →  client/src/i18n/locale/{pl,en,pt}.json
```

### Wzorzec kontrolera (kopiuj dla każdego endpointu)

```java
// AdminController.java — dodaj nową metodę
@PatchMapping("/characters/{characterName}/kick")
public ResponseEntity<Void> kickCharacter(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String characterName) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    adminService.kickCharacter(characterName);
    return ResponseEntity.noContent().build();
}
```

### Wzorzec hooka React Query (kopiuj dla każdej mutacji)

```typescript
// client/src/api/admin.ts — dodaj nowy hook
export const useKickCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (characterName: string) =>
      api.patch(`/admin/characters/${characterName}/kick`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
};
```

---

## Lista funkcji do migracji

### 1. Kick gracza (wyrzucenie z serwera)

**Priorytet: Wysoki** — najczęściej używana akcja adminów.

**Backend — AdminService.java:**

```java
public void kickCharacter(String characterName) throws NotFoundException {
    Character character = characterRepository.findByNameIgnoreCase(characterName)
        .orElseThrow(() -> new NotFoundException("Character not found"));
    // Ustaw CurrentMap i pozycję na null lub domyślną lokację respawnu
    character.setCurrentMap(null);
    characterRepository.save(character);
    // UWAGA: kick z aktywnej sesji wymaga sygnału przez SignalR do OpenMU.
    // Sama zmiana w DB odłączy gracza przy następnym reconnect.
    // Pełny kick przez API OpenMU: POST /admin/player/{name}/disconnect
}
```

**Backend — nowe repozytorium (jeśli brak):**

```java
// CharacterRepository.java — dodaj jeśli nie ma:
Optional<Character> findByNameIgnoreCase(String name);
```

**Backend — AdminController.java:**

```java
@PatchMapping("/characters/{characterName}/kick")
public ResponseEntity<Void> kickCharacter(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String characterName) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    adminService.kickCharacter(characterName);
    return ResponseEntity.noContent().build();
}
```

**Frontend — admin.ts:**

```typescript
export const useKickCharacter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (characterName: string) =>
      api.patch(`/admin/characters/${characterName}/kick`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] }),
  });
};
```

**Frontend — Admin.tsx** — dodaj przycisk "Kick" przy każdym graczu online w tabeli, albo w widoku szczegółów konta.

**i18n** — dodaj do sekcji `"admin"`:
```json
"kickButton": "Kick",
"kickSuccess": "Gracz wyrzucony."
```

---

### 2. Przenieś postać na mapę (teleport admina)

**Priorytet: Średni**

**Backend — DTO:**

```java
// AdminTeleportDTO.java
@Data @NoArgsConstructor
public class AdminTeleportDTO {
    private String mapName;  // np. "Lorencia"
    private short x;
    private short y;
}
```

**Backend — AdminService.java:**

```java
public CharacterDTO teleportCharacter(String characterName, AdminTeleportDTO dto) throws NotFoundException {
    Character character = characterRepository.findByNameIgnoreCase(characterName)
        .orElseThrow(() -> new NotFoundException("Character not found"));

    GameMapDefinition map = gameMapRepository.findByNameIgnoreCase(dto.getMapName())
        .orElseThrow(() -> new NotFoundException("Map not found: " + dto.getMapName()));

    character.setCurrentMap(map);
    character.setPositionX(dto.getX());
    character.setPositionY(dto.getY());
    return CharacterService.mapToCharacterDTO(characterRepository.save(character));
}
```

**Backend — AdminController.java:**

```java
@PatchMapping("/characters/{characterName}/teleport")
public ResponseEntity<CharacterDTO> teleportCharacter(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String characterName,
        @RequestBody AdminTeleportDTO dto) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    return ResponseEntity.ok(adminService.teleportCharacter(characterName, dto));
}
```

**Frontend — admin.ts:**

```typescript
export const useTeleportCharacter = () =>
  useMutation({
    mutationFn: ({ characterName, mapName, x, y }: { characterName: string; mapName: string; x: number; y: number }) =>
      api.patch(`/admin/characters/${characterName}/teleport`, { mapName, x, y }),
  });
```

---

### 3. Reset postaci przez admina (bez wymagań)

**Priorytet: Średni** — admin może zresetować każdą postać, bez sprawdzania zen/limitów.

**Backend — AdminService.java:**

```java
public CharacterDTO forceResetCharacter(String characterName) throws NotFoundException {
    // Używa istniejącej logiki CharacterService.resetCharacter,
    // ale omija walidację (zen, limit resetów, połączenie z serwerem)
    Character character = characterRepository.findByNameIgnoreCase(characterName)
        .orElseThrow(() -> new NotFoundException("Character not found"));

    character.setLevelUpPoints(character.getLevelUpPoints() + /* pointsPerReset */);
    character.setResetCount(character.getResetCount() + 1);
    // ustaw level na postResetLevel z konfiguracji
    characterRepository.save(character);
    return CharacterService.mapToCharacterDTO(character);
}
```

**Uwaga:** Sprawdź `CharacterService.resetCharacter()` i skopiuj logikę, pomijając `checkIfConnected` i `checkZen`.

**Backend — AdminController.java:**

```java
@PatchMapping("/characters/{characterName}/force-reset")
public ResponseEntity<CharacterDTO> forceResetCharacter(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String characterName) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    return ResponseEntity.ok(adminService.forceResetCharacter(characterName));
}
```

---

### 4. Edycja atrybutów postaci przez admina

**Priorytet: Niski**

Istniejący endpoint `PATCH /characters/{name}/attributes` sprawdza czy postać należy do zalogowanego gracza. Wystarczy dodać admin-wariant bez tego sprawdzenia:

**Backend — AdminService.java:**

```java
public CharacterDTO updateCharacterAttributesAsAdmin(String characterName, CharacterAttributesDTO dto) throws NotFoundException {
    // Wywołaj CharacterService ale bez sprawdzania właściciela
    return characterService.updateCharacterAttributesForAdmin(characterName, dto);
}
```

**Backend — AdminController.java:**

```java
@PatchMapping("/characters/{characterName}/attributes")
public ResponseEntity<CharacterDTO> updateCharacterAttributes(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String characterName,
        @RequestBody @Valid CharacterAttributesDTO dto) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    return ResponseEntity.ok(adminService.updateCharacterAttributesAsAdmin(characterName, dto));
}
```

---

### 5. Zarządzanie guildem (rozwiązanie, zmiana mistrza)

**Priorytet: Niski**

**Backend — AdminService.java:**

```java
public void disbandGuild(String guildName) throws NotFoundException {
    Guild guild = guildRepository.findByNameIgnoreCase(guildName)
        .orElseThrow(() -> new NotFoundException("Guild not found"));
    guildMemberRepository.deleteByGuildId(guild.getId());
    guildRepository.delete(guild);
}
```

**Backend — AdminController.java:**

```java
@DeleteMapping("/guilds/{guildName}")
public ResponseEntity<Void> disbandGuild(
        @AuthenticationPrincipal Jwt principal,
        @PathVariable String guildName) throws ForbiddenException, NotFoundException {
    adminService.checkAdminPrivileges(principal);
    adminService.disbandGuild(guildName);
    return ResponseEntity.noContent().build();
}
```

---

### 6. Lista online graczy z akcjami admina

**Priorytet: Wysoki** — przydatne do szybkiego kickowania/banowania.

Istniejący endpoint `GET /online-players` zwraca graczy. Wystarczy w CMS w widoku `/admin` dodać zakładkę "Online Players" z tabelą i przyciskami Kick/Ban przy każdym graczu.

**Frontend — Admin.tsx** — nowa zakładka obok "Konta":

```tsx
// Dodaj tab "Online" do istniejącego layoutu Admin.tsx
const { data: onlinePlayers } = useQuery({
  queryKey: ['online-players'],
  queryFn: () => api.get('/online-players').then(r => r.data),
  refetchInterval: 30_000, // odśwież co 30 sekund
});
```

Dane już przychodzą z backendu (istniejący endpoint) — nie trzeba nic dodawać w Javie.

---

### 7. Wiadomość do gracza/broadcast (chat admina)

**Priorytet: Średni**

Istnieje już `ChatController.java` i `ChatMessageDTO.java`. Sprawdź czy obsługuje wiadomości admin→gracz.

**Sprawdź:**
```bash
cat server/src/main/java/io/github/felipeemerson/openmuapi/controllers/ChatController.java
```

Jeśli nie ma endpointu do wysyłania wiadomości przez admina, dodaj:

**Backend — AdminController.java:**

```java
@PostMapping("/broadcast")
public ResponseEntity<Void> broadcastMessage(
        @AuthenticationPrincipal Jwt principal,
        @RequestBody BroadcastMessageDTO dto) throws ForbiddenException {
    adminService.checkAdminPrivileges(principal);
    adminService.broadcastMessage(dto.getMessage());
    return ResponseEntity.noContent().build();
}
```

---

## Frontend — rozszerzenie strony Admin.tsx

Obecna strona `/admin` ma tylko tabelę kont. Zalecana struktura po migracji:

```
/admin
  ├── [Zakładka] Konta        — istniejące + kick przy zalogowanych
  ├── [Zakładka] Online       — lista online z akcjami kick/ban
  ├── [Zakładka] Postacie     — wyszukiwarka postaci + teleport/reset/atrybuty
  └── [Zakładka] Guildy       — lista guildów + rozwiązanie
```

**Wzorzec zakładek** (kopiuj z `Rankings.tsx` który już używa zakładek):

```tsx
import { useState } from 'react';

const TABS = ['accounts', 'online', 'characters', 'guilds'] as const;
type Tab = typeof TABS[number];

const [activeTab, setActiveTab] = useState<Tab>('accounts');
```

---

## Baza danych — ważne encje

Wszystkie encje OpenMU są w schemacie Postgresa. Kluczowe tabele:

| Tabela | Encja Java | Ważne pola |
|--------|-----------|------------|
| `mu_character` | `Character` | `name`, `currentMap`, `positionX/Y`, `resetCount`, `levelUpPoints` |
| `mu_account` | `Account` | `loginName`, `email`, `state`, `registrationDate` |
| `mu_guild` | `Guild` | `name`, `score`, `logo` |
| `mu_guild_member` | `GuildMember` | `character`, `guildPosition` |
| `mu_map_definition` | `GameMapDefinition` | `name`, `number` |

Repozytoria Spring Data JPA są w `server/src/main/java/.../repositories/`.

---

## Deployment — jak wdrożyć zmiany

Projekt używa automatycznego deploymentu przez post-commit hook. Po commit + push:

1. **Backend** (`cms-api`) — hook automatycznie przebudowuje kontener Docker. Sprawdź logi:
   ```bash
   cd /home/openclawops/services/blowmu-prod
   docker compose logs -f cms-api
   ```

2. **Frontend** (`cms-web`) — hook automatycznie przebudowuje i restartuje kontener. Sprawdź:
   ```bash
   docker compose logs -f cms-web
   ```

3. Jeśli hook nie zadziałał, ręczny rebuild:
   ```bash
   cd /home/openclawops/services/blowmu-prod
   docker compose build cms-api cms-web
   docker compose up -d cms-api cms-web
   ```

---

## Kolejność prac (rekomendowana)

1. **Lista online z akcjami kick/ban** — dane już dostępne, tylko UI
2. **Kick gracza** — backend + przycisk w tabeli online
3. **Reset postaci przez admina** — kopia logiki z CharacterService
4. **Teleport postaci** — nowy DTO + endpoint
5. **Zakładka postaci** — wyszukiwarka + akcje
6. **Rozwiązanie guildu** — rzadko potrzebne, na końcu
