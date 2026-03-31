package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.AccountStateChangeDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import io.github.felipeemerson.openmuapi.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AccountRepository accountRepository;
    private final AccountService accountService;

    public AdminService(@Autowired AccountRepository accountRepository,
                        @Autowired AccountService accountService) {
        this.accountRepository = accountRepository;
        this.accountService = accountService;
    }

    public void checkAdminPrivileges(Jwt principal) throws ForbiddenException {
        String role = JwtUtils.getRole(principal);
        if (!AccountState.GAME_MASTER.name().equals(role) && !AccountState.GAME_MASTER_INVISIBLE.name().equals(role)) {
            throw new ForbiddenException("Admin privileges required.");
        }
    }

    public Page<AccountDTO> getAccounts(int page, int size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("loginName").ascending());

        Page<Account> accounts;
        if (search != null && !search.isBlank()) {
            accounts = accountRepository.findByLoginNameContainingIgnoreCase(search, pageRequest);
        } else {
            accounts = accountRepository.findAll(pageRequest);
        }

        return accounts.map(AccountService::mapNewAccountToAccountDTO);
    }

    public AccountDTO changeAccountState(String loginName, AccountStateChangeDTO dto) throws NotFoundException {
        Account account = accountService.getAccountByLoginName(loginName);
        account.setState(dto.getState());
        return AccountService.mapNewAccountToAccountDTO(accountRepository.save(account));
    }
}
