package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.BetaSocialLinksDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
import io.github.felipeemerson.openmuapi.dto.LogFileEntryDTO;
import io.github.felipeemerson.openmuapi.dto.ManageableServerDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountCreateDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountUpdateDTO;
import io.github.felipeemerson.openmuapi.exceptions.BadRequestException;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.services.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/super-admin")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(@Autowired SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @GetMapping("/runtime/logged-in")
    public ResponseEntity<List<LoggedInAccountDTO>> getLoggedInAccounts(
            @AuthenticationPrincipal Jwt principal) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.getLoggedInAccounts());
    }

    @GetMapping("/runtime/servers")
    public ResponseEntity<List<ManageableServerDTO>> getManageableServers(
            @AuthenticationPrincipal Jwt principal) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.getManageableServers());
    }

    @GetMapping("/runtime/logfiles")
    public ResponseEntity<List<LogFileEntryDTO>> getLogFiles(
            @AuthenticationPrincipal Jwt principal) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.getLogFiles());
    }

    @GetMapping("/settings/social-links")
    public ResponseEntity<BetaSocialLinksDTO> getBetaSocialLinks(
            @AuthenticationPrincipal Jwt principal) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.getBetaSocialLinks());
    }

    @PutMapping("/settings/social-links")
    public ResponseEntity<BetaSocialLinksDTO> updateBetaSocialLinks(
            @AuthenticationPrincipal Jwt principal,
            @RequestBody BetaSocialLinksDTO dto) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.updateBetaSocialLinks(dto));
    }

    @GetMapping("/accounts/{loginName}")
    public ResponseEntity<AccountDTO> getManagedAccount(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String loginName) throws ForbiddenException, NotFoundException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.getManagedAccount(loginName));
    }

    @PostMapping("/accounts")
    public ResponseEntity<AccountDTO> createManagedAccount(
            @AuthenticationPrincipal Jwt principal,
            @RequestBody @Valid SuperAdminAccountCreateDTO dto) throws ForbiddenException, BadRequestException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.createManagedAccount(dto));
    }

    @PutMapping("/accounts/{loginName}")
    public ResponseEntity<AccountDTO> updateManagedAccount(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String loginName,
            @RequestBody @Valid SuperAdminAccountUpdateDTO dto)
            throws ForbiddenException, NotFoundException, BadRequestException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        return ResponseEntity.ok(this.superAdminService.updateManagedAccount(loginName, dto));
    }

    @PostMapping("/runtime/logged-in/{loginName}/disconnect")
    public ResponseEntity<Void> disconnectLoggedInAccount(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable String loginName,
            @RequestParam int serverId) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        this.superAdminService.disconnectLoggedInAccount(loginName, serverId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/runtime/servers/{serverId}/start")
    public ResponseEntity<Void> startManageableServer(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable int serverId) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        this.superAdminService.startManageableServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/runtime/servers/{serverId}/stop")
    public ResponseEntity<Void> stopManageableServer(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable int serverId) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        this.superAdminService.stopManageableServer(serverId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/runtime/servers/{serverId}")
    public ResponseEntity<Void> removeManageableServer(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable int serverId,
            @RequestParam String type) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        this.superAdminService.removeManageableServer(serverId, type);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/runtime/servers/restart-all")
    public ResponseEntity<Void> restartAllManageableServers(
            @AuthenticationPrincipal Jwt principal) throws ForbiddenException {
        this.superAdminService.checkSuperAdminPrivileges(principal);
        this.superAdminService.restartAllManageableServers();
        return ResponseEntity.noContent().build();
    }
}
