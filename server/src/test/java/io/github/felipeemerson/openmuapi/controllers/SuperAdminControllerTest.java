package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountCreateDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountUpdateDTO;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.services.SuperAdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuperAdminControllerTest {

    @Mock
    private SuperAdminService superAdminService;

    @Test
    void getLoggedInAccountsChecksPrivilegesFirst() {
        SuperAdminController controller = new SuperAdminController(superAdminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );
        List<LoggedInAccountDTO> accounts = List.of(new LoggedInAccountDTO("admin", 0));
        when(superAdminService.getLoggedInAccounts()).thenReturn(accounts);

        var response = controller.getLoggedInAccounts(principal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(accounts, response.getBody());

        InOrder inOrder = inOrder(superAdminService);
        inOrder.verify(superAdminService).checkSuperAdminPrivileges(principal);
        inOrder.verify(superAdminService).getLoggedInAccounts();
    }

    @Test
    void disconnectLoggedInAccountChecksPrivilegesFirst() {
        SuperAdminController controller = new SuperAdminController(superAdminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );

        var response = controller.disconnectLoggedInAccount(principal, "admin", 0);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        InOrder inOrder = inOrder(superAdminService);
        inOrder.verify(superAdminService).checkSuperAdminPrivileges(principal);
        inOrder.verify(superAdminService).disconnectLoggedInAccount("admin", 0);
    }

    @Test
    void getManagedAccountChecksPrivilegesFirst() {
        SuperAdminController controller = new SuperAdminController(superAdminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );
        AccountDTO account = new AccountDTO();
        account.setLoginName("admin");
        when(superAdminService.getManagedAccount("admin")).thenReturn(account);

        var response = controller.getManagedAccount(principal, "admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(account, response.getBody());

        InOrder inOrder = inOrder(superAdminService);
        inOrder.verify(superAdminService).checkSuperAdminPrivileges(principal);
        inOrder.verify(superAdminService).getManagedAccount("admin");
    }

    @Test
    void createManagedAccountChecksPrivilegesFirst() {
        SuperAdminController controller = new SuperAdminController(superAdminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );
        SuperAdminAccountCreateDTO dto = new SuperAdminAccountCreateDTO(
                "admin",
                "admin@example.com",
                "secret123",
                "pin123",
                AccountState.SUPER_ADMIN
        );
        AccountDTO created = new AccountDTO();
        created.setLoginName("admin");
        when(superAdminService.createManagedAccount(dto)).thenReturn(created);

        var response = controller.createManagedAccount(principal, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(created, response.getBody());

        InOrder inOrder = inOrder(superAdminService);
        inOrder.verify(superAdminService).checkSuperAdminPrivileges(principal);
        inOrder.verify(superAdminService).createManagedAccount(dto);
    }

    @Test
    void updateManagedAccountChecksPrivilegesFirst() {
        SuperAdminController controller = new SuperAdminController(superAdminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );
        SuperAdminAccountUpdateDTO dto = new SuperAdminAccountUpdateDTO(
                "admin@example.com",
                "pin123",
                AccountState.NORMAL,
                "vault",
                true,
                "new-secret"
        );
        AccountDTO updated = new AccountDTO();
        updated.setLoginName("admin");
        when(superAdminService.updateManagedAccount("admin", dto)).thenReturn(updated);

        var response = controller.updateManagedAccount(principal, "admin", dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updated, response.getBody());

        InOrder inOrder = inOrder(superAdminService);
        inOrder.verify(superAdminService).checkSuperAdminPrivileges(principal);
        inOrder.verify(superAdminService).updateManagedAccount("admin", dto);
    }
}
