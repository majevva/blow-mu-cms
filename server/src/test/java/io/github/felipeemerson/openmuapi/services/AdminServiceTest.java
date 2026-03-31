package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.entities.Character;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import io.github.felipeemerson.openmuapi.repositories.CharacterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CharacterRepository characterRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private GameServerService gameServerService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void kickCharacterDisconnectsResolvedCharacterName() {
        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setName("HeroOne");

        when(characterRepository.findByNameIgnoreCase("heroone"))
                .thenReturn(Optional.of(character));

        adminService.kickCharacter("heroone");

        verify(gameServerService).disconnectCharacter("HeroOne");
    }

    @Test
    void kickCharacterThrowsWhenCharacterDoesNotExist() {
        when(characterRepository.findByNameIgnoreCase("missing"))
                .thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> adminService.kickCharacter("missing")
        );

        assertEquals("Character missing not found.", exception.getMessage());
        verify(gameServerService, never()).disconnectCharacter(anyString());
    }

    @Test
    void temporarilyBanCharacterUpdatesAccountStateAndDisconnectsCharacter() {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setLoginName("gm-target");
        account.setState(AccountState.NORMAL);

        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setName("HeroOne");
        character.setAccount(account);

        when(characterRepository.findByNameIgnoreCase("heroone"))
                .thenReturn(Optional.of(character));

        adminService.temporarilyBanCharacter("heroone");

        assertEquals(AccountState.TEMPORARILY_BANNED, account.getState());
        verify(accountRepository).save(account);
        verify(gameServerService).disconnectCharacter("HeroOne");
    }

    @Test
    void broadcastMessageDelegatesToGameServerService() {
        AdminBroadcastDTO dto = new AdminBroadcastDTO("Server maintenance in 5 minutes.", 1);

        adminService.broadcastMessage(dto, "gm-user");

        verify(gameServerService).sendServerMessage(eq("Server maintenance in 5 minutes."), eq(1), eq("gm-user"));
    }

    @Test
    void checkAdminPrivilegesAllowsSuperAdminRole() {
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );

        adminService.checkAdminPrivileges(principal);
    }

    @Test
    void checkSuperAdminPrivilegesRejectsGameMasterRole() {
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );

        assertThrows(ForbiddenException.class, () -> adminService.checkSuperAdminPrivileges(principal));
    }
}
