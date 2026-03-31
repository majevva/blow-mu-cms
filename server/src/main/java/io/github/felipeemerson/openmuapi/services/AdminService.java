package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.dto.AccountStateChangeDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.entities.Character;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import io.github.felipeemerson.openmuapi.repositories.CharacterRepository;
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
    private final CharacterRepository characterRepository;
    private final AccountService accountService;
    private final GameServerService gameServerService;

    public AdminService(@Autowired AccountRepository accountRepository,
                        @Autowired CharacterRepository characterRepository,
                        @Autowired AccountService accountService,
                        @Autowired GameServerService gameServerService) {
        this.accountRepository = accountRepository;
        this.characterRepository = characterRepository;
        this.accountService = accountService;
        this.gameServerService = gameServerService;
    }

    public void checkAdminPrivileges(Jwt principal) throws ForbiddenException {
        AccountState role = AccountState.valueOf(JwtUtils.getRole(principal));
        if (!role.canAccessGameMasterPanel()) {
            throw new ForbiddenException("Admin privileges required.");
        }
    }

    public void checkSuperAdminPrivileges(Jwt principal) throws ForbiddenException {
        AccountState role = AccountState.valueOf(JwtUtils.getRole(principal));
        if (!role.canAccessSuperAdminPanel()) {
            throw new ForbiddenException("Super admin privileges required.");
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

    public void kickCharacter(String characterName) throws NotFoundException {
        Character character = characterRepository.findByNameIgnoreCase(characterName)
                .orElseThrow(() -> new NotFoundException(String.format("Character %s not found.", characterName)));

        gameServerService.disconnectCharacter(character.getName());
    }

    public void temporarilyBanCharacter(String characterName) throws NotFoundException {
        Character character = characterRepository.findByNameIgnoreCase(characterName)
                .orElseThrow(() -> new NotFoundException(String.format("Character %s not found.", characterName)));

        Account account = character.getAccount();
        account.setState(AccountState.TEMPORARILY_BANNED);
        accountRepository.save(account);

        gameServerService.disconnectCharacter(character.getName());
    }

    public void broadcastMessage(AdminBroadcastDTO dto, String loginName) {
        gameServerService.sendServerMessage(dto.getMessage().trim(), dto.getServerId(), loginName);
    }
}
