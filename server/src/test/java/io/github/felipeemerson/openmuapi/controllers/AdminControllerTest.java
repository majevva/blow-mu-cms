package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.dto.AdminTeleportDTO;
import io.github.felipeemerson.openmuapi.dto.ChangeGuildMasterDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterAttributesDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterDTO;
import io.github.felipeemerson.openmuapi.dto.GuildDTO;
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

    @Test
    void getCharacterReturnsDtoAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );
        CharacterDTO dto = new CharacterDTO();
        org.mockito.Mockito.when(adminService.getCharacterByName("HeroOne")).thenReturn(dto);

        var response = controller.getCharacter(principal, "HeroOne");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).getCharacterByName("HeroOne");
    }

    @Test
    void teleportCharacterReturnsDtoAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );
        AdminTeleportDTO payload = new AdminTeleportDTO("Lorencia", (short) 120, (short) 121);
        CharacterDTO dto = new CharacterDTO();
        org.mockito.Mockito.when(adminService.teleportCharacter("HeroOne", payload)).thenReturn(dto);

        var response = controller.teleportCharacter(principal, "HeroOne", payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).teleportCharacter("HeroOne", payload);
    }

    @Test
    void updateCharacterAttributesReturnsDtoAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );
        CharacterAttributesDTO payload = new CharacterAttributesDTO(10, 5, 0, 0, 0);
        CharacterDTO dto = new CharacterDTO();
        org.mockito.Mockito.when(adminService.updateCharacterAttributesAsAdmin("HeroOne", payload)).thenReturn(dto);

        var response = controller.updateCharacterAttributes(principal, "HeroOne", payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).updateCharacterAttributesAsAdmin("HeroOne", payload);
    }

    @Test
    void changeGuildMasterReturnsDtoAndChecksPrivilegesFirst() {
        AdminController controller = new AdminController(adminService);
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );
        ChangeGuildMasterDTO payload = new ChangeGuildMasterDTO("HeroTwo");
        GuildDTO dto = new GuildDTO();
        org.mockito.Mockito.when(adminService.changeGuildMaster("Legends", payload)).thenReturn(dto);

        var response = controller.changeGuildMaster(principal, "Legends", payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());

        InOrder inOrder = inOrder(adminService);
        inOrder.verify(adminService).checkAdminPrivileges(principal);
        inOrder.verify(adminService).changeGuildMaster("Legends", payload);
    }
}
