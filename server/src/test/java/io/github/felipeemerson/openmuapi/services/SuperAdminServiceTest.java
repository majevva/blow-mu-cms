package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.BetaSocialLinksDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
import io.github.felipeemerson.openmuapi.dto.ManageableServerDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountCreateDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountUpdateDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class SuperAdminServiceTest {

    @Mock
    private AdminService adminService;

    @Mock
    private AccountService accountService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GameServerService gameServerService;

    @Mock
    private SocialMediaLinkService socialMediaLinkService;

    @InjectMocks
    private SuperAdminService superAdminService;

    @Test
    void getLoggedInAccountsDelegatesToGameServerService() {
        List<LoggedInAccountDTO> expected = List.of(new LoggedInAccountDTO("admin", 0));
        when(gameServerService.getLoggedInAccounts()).thenReturn(expected);

        var result = superAdminService.getLoggedInAccounts();

        assertEquals(expected, result);
    }

    @Test
    void disconnectLoggedInAccountDelegatesToGameServerService() {
        superAdminService.disconnectLoggedInAccount("admin", 0);

        verify(gameServerService).disconnectAccount("admin", 0);
    }

    @Test
    void checkSuperAdminPrivilegesDelegatesToAdminService() {
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );

        superAdminService.checkSuperAdminPrivileges(principal);

        verify(adminService).checkSuperAdminPrivileges(principal);
    }

    @Test
    void getManagedAccountDelegatesToAccountService() {
        AccountDTO account = new AccountDTO();
        account.setLoginName("admin");
        when(accountService.getAccountDTOByLoginName("admin")).thenReturn(account);

        var result = superAdminService.getManagedAccount("admin");

        assertEquals(account, result);
    }

    @Test
    void createManagedAccountPersistsNewAccount() {
        SuperAdminAccountCreateDTO dto = new SuperAdminAccountCreateDTO(
                "admin",
                "admin@example.com",
                "secret123",
                "pin123",
                AccountState.SUPER_ADMIN
        );
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-secret");

        var result = superAdminService.createManagedAccount(dto);

        assertEquals("admin", result.getLoginName());
        assertEquals("admin@example.com", result.getEmail());
        assertEquals(AccountState.SUPER_ADMIN, result.getState());
        verify(accountRepository).save(any(Account.class));
        verify(passwordEncoder).encode("secret123");
    }

    @Test
    void updateManagedAccountDelegatesAndReturnsRefreshedDto() {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setLoginName("admin");
        account.setEmail("old@example.com");
        account.setSecurityCode("old-code");
        account.setState(AccountState.NORMAL);

        SuperAdminAccountUpdateDTO dto = new SuperAdminAccountUpdateDTO(
                "admin@example.com",
                "pin123",
                AccountState.GAME_MASTER,
                "vault",
                true,
                "new-secret"
        );
        AccountDTO expected = new AccountDTO();
        expected.setLoginName("admin");
        expected.setEmail("admin@example.com");
        expected.setState(AccountState.GAME_MASTER);

        when(accountService.getAccountByLoginName("admin")).thenReturn(account);
        when(accountService.getAccountDTOByLoginName("admin")).thenReturn(expected);
        when(passwordEncoder.encode("new-secret")).thenReturn("encoded-secret");

        var result = superAdminService.updateManagedAccount("admin", dto);

        assertEquals(expected, result);
        verify(accountRepository).save(account);
        verify(passwordEncoder).encode("new-secret");
        verify(accountService).getAccountDTOByLoginName("admin");
    }

    @Test
    void getManageableServersDelegatesToGameServerService() {
        List<ManageableServerDTO> expected = List.of(
                new ManageableServerDTO(0, UUID.randomUUID(), "Server 0", "GameServer", "Started", 10, 100)
        );
        when(gameServerService.getManageableServers()).thenReturn(expected);

        var result = superAdminService.getManageableServers();

        assertEquals(expected, result);
    }

    @Test
    void startManageableServerDelegatesToGameServerService() {
        superAdminService.startManageableServer(0);

        verify(gameServerService).startManageableServer(0);
    }

    @Test
    void stopManageableServerDelegatesToGameServerService() {
        superAdminService.stopManageableServer(0);

        verify(gameServerService).stopManageableServer(0);
    }

    @Test
    void removeManageableServerDelegatesToGameServerService() {
        superAdminService.removeManageableServer(0, "GameServer");

        verify(gameServerService).removeManageableServer(0, "GameServer");
    }

    @Test
    void restartAllManageableServersDelegatesToGameServerService() {
        superAdminService.restartAllManageableServers();

        verify(gameServerService).restartAllManageableServers();
    }

    @Test
    void getBetaSocialLinksDelegatesToSocialMediaLinkService() {
        BetaSocialLinksDTO expected = new BetaSocialLinksDTO(
                "https://instagram.com/blowmu",
                "https://discord.gg/blowmu",
                null,
                "https://youtube.com/@blowmu"
        );
        when(socialMediaLinkService.getBetaSocialLinks()).thenReturn(expected);

        var result = superAdminService.getBetaSocialLinks();

        assertEquals(expected, result);
    }

    @Test
    void updateBetaSocialLinksDelegatesToSocialMediaLinkService() {
        BetaSocialLinksDTO payload = new BetaSocialLinksDTO(
                "https://instagram.com/blowmu",
                "",
                "https://facebook.com/blowmu",
                ""
        );
        when(socialMediaLinkService.updateBetaSocialLinks(payload)).thenReturn(payload);

        var result = superAdminService.updateBetaSocialLinks(payload);

        assertEquals(payload, result);
        verify(socialMediaLinkService).updateBetaSocialLinks(payload);
    }
}
