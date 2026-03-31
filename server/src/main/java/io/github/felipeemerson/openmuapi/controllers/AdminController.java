package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.dto.AccountStateChangeDTO;
import io.github.felipeemerson.openmuapi.dto.AdminTeleportDTO;
import io.github.felipeemerson.openmuapi.dto.ChangeGuildMasterDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterAttributesDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterDTO;
import io.github.felipeemerson.openmuapi.dto.GuildDTO;
import io.github.felipeemerson.openmuapi.exceptions.BadRequestException;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.services.AdminService;
import io.github.felipeemerson.openmuapi.util.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(@Autowired AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/accounts")
    public ResponseEntity<Page<AccountDTO>> getAccounts(
            @AuthenticationPrincipal Jwt principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) throws ForbiddenException {
        adminService.checkAdminPrivileges(principal);
        return new ResponseEntity<>(adminService.getAccounts(page, size, search), HttpStatus.OK);
    }

    @PutMapping("/accounts/{loginName}/state")
    public ResponseEntity<AccountDTO> changeAccountState(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String loginName,
            @RequestBody AccountStateChangeDTO stateChangeDTO) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        return new ResponseEntity<>(adminService.changeAccountState(loginName, stateChangeDTO), HttpStatus.OK);
    }

    @PatchMapping("/characters/{characterName}/kick")
    public ResponseEntity<Void> kickCharacter(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        adminService.kickCharacter(characterName);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/characters/{characterName}/temporary-ban")
    public ResponseEntity<Void> temporarilyBanCharacter(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        adminService.temporarilyBanCharacter(characterName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/characters/{characterName}")
    public ResponseEntity<CharacterDTO> getCharacter(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.getCharacterByName(characterName));
    }

    @PatchMapping("/characters/{characterName}/teleport")
    public ResponseEntity<CharacterDTO> teleportCharacter(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName,
            @RequestBody @Valid AdminTeleportDTO dto) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.teleportCharacter(characterName, dto));
    }

    @PatchMapping("/characters/{characterName}/force-reset")
    public ResponseEntity<CharacterDTO> forceResetCharacter(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.forceResetCharacter(characterName));
    }

    @PatchMapping("/characters/{characterName}/attributes")
    public ResponseEntity<CharacterDTO> updateCharacterAttributes(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String characterName,
            @RequestBody @Valid CharacterAttributesDTO dto)
            throws ForbiddenException, NotFoundException, BadRequestException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.updateCharacterAttributesAsAdmin(characterName, dto));
    }

    @GetMapping("/guilds/{guildName}")
    public ResponseEntity<GuildDTO> getGuild(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String guildName) throws ForbiddenException, NotFoundException, BadRequestException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.getGuildByName(guildName));
    }

    @DeleteMapping("/guilds/{guildName}")
    public ResponseEntity<Void> disbandGuild(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String guildName) throws ForbiddenException, NotFoundException {
        adminService.checkAdminPrivileges(principal);
        adminService.disbandGuild(guildName);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/guilds/{guildName}/master")
    public ResponseEntity<GuildDTO> changeGuildMaster(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String guildName,
            @RequestBody @Valid ChangeGuildMasterDTO dto)
            throws ForbiddenException, NotFoundException, BadRequestException {
        adminService.checkAdminPrivileges(principal);
        return ResponseEntity.ok(adminService.changeGuildMaster(guildName, dto));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcastMessage(
            @AuthenticationPrincipal Jwt principal,
            @RequestBody @Valid AdminBroadcastDTO dto) throws ForbiddenException {
        adminService.checkAdminPrivileges(principal);
        adminService.broadcastMessage(dto, JwtUtils.getLoginNameFromToken(principal));
        return ResponseEntity.noContent().build();
    }
}
