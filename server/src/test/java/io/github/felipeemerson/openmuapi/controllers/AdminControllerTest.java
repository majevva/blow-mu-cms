package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.services.AdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @Test
    void kickCharacterReturnsNoContentAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );

        var response = controller.kickCharacter(principal, "HeroOne");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).kickCharacter("HeroOne");
    }

    @Test
    void temporarilyBanCharacterReturnsNoContentAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );

        var response = controller.temporarilyBanCharacter(principal, "HeroOne");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).temporarilyBanCharacter("HeroOne");
    }

    @Test
    void broadcastMessageReturnsNoContentAndForwardsLoginName() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );
        AdminBroadcastDTO dto = new AdminBroadcastDTO("Server maintenance in 5 minutes.", 1);

        var response = controller.broadcastMessage(principal, dto);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).broadcastMessage(dto, "gm-user");
        verify(adminService).broadcastMessage(dto, "gm-user");
    }
}
