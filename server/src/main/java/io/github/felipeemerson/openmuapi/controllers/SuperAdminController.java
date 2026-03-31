package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
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
}
