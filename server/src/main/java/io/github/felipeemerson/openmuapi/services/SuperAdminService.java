package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
import io.github.felipeemerson.openmuapi.dto.ManageableServerDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountCreateDTO;
import io.github.felipeemerson.openmuapi.dto.SuperAdminAccountUpdateDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.exceptions.BadRequestException;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class SuperAdminService {

    private final AdminService adminService;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final GameServerService gameServerService;

    public SuperAdminService(@Autowired AdminService adminService,
                             @Autowired AccountService accountService,
                             @Autowired AccountRepository accountRepository,
                             @Autowired PasswordEncoder passwordEncoder,
                             @Autowired GameServerService gameServerService) {
        this.adminService = adminService;
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.gameServerService = gameServerService;
    }

    public void checkSuperAdminPrivileges(Jwt principal) throws ForbiddenException {
        this.adminService.checkSuperAdminPrivileges(principal);
    }

    public List<LoggedInAccountDTO> getLoggedInAccounts() {
        return this.gameServerService.getLoggedInAccounts();
    }

    public void disconnectLoggedInAccount(String loginName, int serverId) {
        this.gameServerService.disconnectAccount(loginName, serverId);
    }

    public List<ManageableServerDTO> getManageableServers() {
        return this.gameServerService.getManageableServers();
    }

    public void startManageableServer(int serverId) {
        this.gameServerService.startManageableServer(serverId);
    }

    public void stopManageableServer(int serverId) {
        this.gameServerService.stopManageableServer(serverId);
    }

    public void removeManageableServer(int serverId, String type) {
        this.gameServerService.removeManageableServer(serverId, type);
    }

    public void restartAllManageableServers() {
        this.gameServerService.restartAllManageableServers();
    }

    public AccountDTO getManagedAccount(String loginName) throws NotFoundException {
        return this.accountService.getAccountDTOByLoginName(loginName);
    }

    public AccountDTO createManagedAccount(SuperAdminAccountCreateDTO dto) throws BadRequestException {
        if (this.accountRepository.existsByLoginName(dto.getLoginName())) {
            throw new BadRequestException("Login name already exists");
        }

        if (this.accountRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setLoginName(dto.getLoginName().trim());
        account.setEmail(dto.getEmail().trim());
        account.setPasswordHash(this.passwordEncoder.encode(dto.getPassword()));
        account.setSecurityCode(dto.getSecurityCode().trim());
        account.setState(dto.getState());
        account.setRegistrationDate(new Timestamp(new Date().getTime()));
        account.setTimeZone((short) 0);
        account.setVaultPassword("");
        account.setVaultExtended(false);

        return AccountService.mapNewAccountToAccountDTO(this.accountRepository.save(account));
    }

    public AccountDTO updateManagedAccount(String loginName, SuperAdminAccountUpdateDTO dto)
            throws NotFoundException, BadRequestException {
        Account account = this.accountService.getAccountByLoginName(loginName);

        String normalizedEmail = dto.getEmail().trim();
        if (!account.getEmail().equalsIgnoreCase(normalizedEmail)
                && this.accountRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        account.setEmail(normalizedEmail);
        account.setSecurityCode(dto.getSecurityCode().trim());
        account.setState(dto.getState());
        account.setVaultPassword(dto.getVaultPassword() == null ? "" : dto.getVaultPassword());
        account.setVaultExtended(dto.isVaultExtended());

        if (dto.getNextPassword() != null && !dto.getNextPassword().isBlank()) {
            account.setPasswordHash(this.passwordEncoder.encode(dto.getNextPassword()));
        }

        this.accountRepository.save(account);

        return this.accountService.getAccountDTOByLoginName(loginName);
    }
}
