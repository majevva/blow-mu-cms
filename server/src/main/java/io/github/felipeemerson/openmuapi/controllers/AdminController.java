package io.github.felipeemerson.openmuapi.controllers;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.AccountStateChangeDTO;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.services.AdminService;
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
}
