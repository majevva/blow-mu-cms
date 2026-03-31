package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AccountDTO;
import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
import io.github.felipeemerson.openmuapi.dto.AccountStateChangeDTO;
import io.github.felipeemerson.openmuapi.dto.AdminTeleportDTO;
import io.github.felipeemerson.openmuapi.dto.ChangeGuildMasterDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterAttributesDTO;
import io.github.felipeemerson.openmuapi.dto.CharacterDTO;
import io.github.felipeemerson.openmuapi.dto.GuildDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.entities.Character;
import io.github.felipeemerson.openmuapi.entities.GameMapDefinition;
import io.github.felipeemerson.openmuapi.entities.Guild;
import io.github.felipeemerson.openmuapi.entities.GuildMember;
import io.github.felipeemerson.openmuapi.enums.GuildPosition;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.exceptions.BadRequestException;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import io.github.felipeemerson.openmuapi.repositories.CharacterRepository;
import io.github.felipeemerson.openmuapi.repositories.GameMapDefinitionRepository;
import io.github.felipeemerson.openmuapi.repositories.GuildMemberRepository;
import io.github.felipeemerson.openmuapi.repositories.GuildRepository;
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
    private final CharacterService characterService;
    private final GuildService guildService;
    private final GuildRepository guildRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final GameMapDefinitionRepository gameMapDefinitionRepository;

    public AdminService(@Autowired AccountRepository accountRepository,
                        @Autowired CharacterRepository characterRepository,
                        @Autowired AccountService accountService,
                        @Autowired GameServerService gameServerService,
                        @Autowired CharacterService characterService,
                        @Autowired GuildService guildService,
                        @Autowired GuildRepository guildRepository,
                        @Autowired GuildMemberRepository guildMemberRepository,
                        @Autowired GameMapDefinitionRepository gameMapDefinitionRepository) {
        this.accountRepository = accountRepository;
        this.characterRepository = characterRepository;
        this.accountService = accountService;
        this.gameServerService = gameServerService;
        this.characterService = characterService;
        this.guildService = guildService;
        this.guildRepository = guildRepository;
        this.guildMemberRepository = guildMemberRepository;
        this.gameMapDefinitionRepository = gameMapDefinitionRepository;
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
        Character character = characterService.getCharacterByNameOrThrow(characterName);

        gameServerService.disconnectCharacter(character.getName());
    }

    public void temporarilyBanCharacter(String characterName) throws NotFoundException {
        Character character = characterService.getCharacterByNameOrThrow(characterName);

        Account account = character.getAccount();
        account.setState(AccountState.TEMPORARILY_BANNED);
        accountRepository.save(account);

        gameServerService.disconnectCharacter(character.getName());
    }

    public CharacterDTO getCharacterByName(String characterName) throws NotFoundException {
        return characterService.getCharacterByNameAsAdmin(characterName);
    }

    public CharacterDTO teleportCharacter(String characterName, AdminTeleportDTO dto) throws NotFoundException {
        Character character = characterService.getCharacterByNameOrThrow(characterName);
        GameMapDefinition map = gameMapDefinitionRepository.findByNameIgnoreCase(dto.getMapName())
                .orElseThrow(() -> new NotFoundException(String.format("Map %s not found.", dto.getMapName())));

        character.setCurrentMap(map);
        character.setPositionX(dto.getX());
        character.setPositionY(dto.getY());

        characterRepository.save(character);

        return characterService.createCharacterDTO(character);
    }

    public CharacterDTO forceResetCharacter(String characterName) throws NotFoundException {
        return characterService.resetCharacterAsAdmin(characterName);
    }

    public CharacterDTO updateCharacterAttributesAsAdmin(String characterName,
                                                         CharacterAttributesDTO dto)
            throws NotFoundException, BadRequestException {
        return characterService.updateCharacterAttributesAsAdmin(characterName, dto);
    }

    public GuildDTO getGuildByName(String guildName) throws NotFoundException, BadRequestException {
        return guildService.getGuildByName(guildName);
    }

    public void disbandGuild(String guildName) throws NotFoundException {
        Guild guild = guildRepository.findByNameIgnoreCase(guildName)
                .orElseThrow(() -> new NotFoundException(String.format("Guild %s not found.", guildName)));

        guildMemberRepository.deleteAll(guild.getMembers());
        guildRepository.delete(guild);
    }

    public GuildDTO changeGuildMaster(String guildName, ChangeGuildMasterDTO dto) throws NotFoundException, BadRequestException {
        Guild guild = guildRepository.findByNameIgnoreCase(guildName)
                .orElseThrow(() -> new NotFoundException(String.format("Guild %s not found.", guildName)));
        Character newMaster = characterService.getCharacterByNameOrThrow(dto.getNewMasterCharacterName());
        GuildMember newMasterMember = guildMemberRepository.findByGuildIdAndId(guild.getId(), newMaster.getId())
                .orElseThrow(() -> new NotFoundException(String.format(
                        "Character %s is not a member of guild %s.",
                        newMaster.getName(),
                        guild.getName()
                )));

        GuildMember oldMaster = guildMemberRepository.findByGuildIdAndStatus(guild.getId(), GuildPosition.GUILD_MASTER)
                .orElse(null);

        if (oldMaster != null && !oldMaster.getId().equals(newMasterMember.getId())) {
            oldMaster.setStatus(GuildPosition.NORMAL);
            guildMemberRepository.save(oldMaster);
        }

        newMasterMember.setStatus(GuildPosition.GUILD_MASTER);
        guildMemberRepository.save(newMasterMember);

        return guildService.getGuildByName(guild.getName());
    }

    public void broadcastMessage(AdminBroadcastDTO dto, String loginName) {
        gameServerService.sendServerMessage(dto.getMessage().trim(), dto.getServerId(), loginName);
    }
}
