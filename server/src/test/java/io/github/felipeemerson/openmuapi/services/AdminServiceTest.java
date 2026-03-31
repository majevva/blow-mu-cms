package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.AdminBroadcastDTO;
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
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.enums.GuildPosition;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.exceptions.NotFoundException;
import io.github.felipeemerson.openmuapi.repositories.AccountRepository;
import io.github.felipeemerson.openmuapi.repositories.CharacterRepository;
import io.github.felipeemerson.openmuapi.repositories.GameMapDefinitionRepository;
import io.github.felipeemerson.openmuapi.repositories.GuildMemberRepository;
import io.github.felipeemerson.openmuapi.repositories.GuildRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CharacterRepository characterRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private GameServerService gameServerService;

    @Mock
    private CharacterService characterService;

    @Mock
    private GuildService guildService;

    @Mock
    private GuildRepository guildRepository;

    @Mock
    private GuildMemberRepository guildMemberRepository;

    @Mock
    private GameMapDefinitionRepository gameMapDefinitionRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    void kickCharacterDisconnectsResolvedCharacterName() {
        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setName("HeroOne");

        when(characterService.getCharacterByNameOrThrow("heroone"))
                .thenReturn(character);

        adminService.kickCharacter("heroone");

        verify(gameServerService).disconnectCharacter("HeroOne");
    }

    @Test
    void kickCharacterThrowsWhenCharacterDoesNotExist() {
        when(characterService.getCharacterByNameOrThrow("missing"))
                .thenThrow(new NotFoundException("Character missing not found."));

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> adminService.kickCharacter("missing")
        );

        assertEquals("Character missing not found.", exception.getMessage());
        verify(gameServerService, never()).disconnectCharacter(anyString());
    }

    @Test
    void temporarilyBanCharacterUpdatesAccountStateAndDisconnectsCharacter() {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setLoginName("gm-target");
        account.setState(AccountState.NORMAL);

        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setName("HeroOne");
        character.setAccount(account);

        when(characterService.getCharacterByNameOrThrow("heroone"))
                .thenReturn(character);

        adminService.temporarilyBanCharacter("heroone");

        assertEquals(AccountState.TEMPORARILY_BANNED, account.getState());
        verify(accountRepository).save(account);
        verify(gameServerService).disconnectCharacter("HeroOne");
    }

    @Test
    void broadcastMessageDelegatesToGameServerService() {
        AdminBroadcastDTO dto = new AdminBroadcastDTO("Server maintenance in 5 minutes.", 1);

        adminService.broadcastMessage(dto, "gm-user");

        verify(gameServerService).sendServerMessage(eq("Server maintenance in 5 minutes."), eq(1), eq("gm-user"));
    }

    @Test
    void teleportCharacterUpdatesMapAndCoordinates() {
        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setName("HeroOne");

        GameMapDefinition map = new GameMapDefinition();
        map.setId(UUID.randomUUID());
        map.setName("Lorencia");

        when(characterService.getCharacterByNameOrThrow("HeroOne")).thenReturn(character);
        when(gameMapDefinitionRepository.findByNameIgnoreCase("Lorencia")).thenReturn(Optional.of(map));

        CharacterDTO dto = new CharacterDTO();
        when(characterService.createCharacterDTO(character)).thenReturn(dto);

        CharacterDTO result = adminService.teleportCharacter("HeroOne", new AdminTeleportDTO("Lorencia", (short) 125, (short) 144));

        assertEquals(dto, result);
        assertEquals(map, character.getCurrentMap());
        assertEquals(125, character.getPositionX());
        assertEquals(144, character.getPositionY());
        verify(characterRepository).save(character);
    }

    @Test
    void updateCharacterAttributesAsAdminDelegatesToCharacterService() {
        CharacterAttributesDTO payload = new CharacterAttributesDTO(10, 15, 5, 0, 0);
        CharacterDTO dto = new CharacterDTO();

        when(characterService.updateCharacterAttributesAsAdmin("HeroOne", payload)).thenReturn(dto);

        CharacterDTO result = adminService.updateCharacterAttributesAsAdmin("HeroOne", payload);

        assertEquals(dto, result);
        verify(characterService).updateCharacterAttributesAsAdmin("HeroOne", payload);
    }

    @Test
    void disbandGuildDeletesMembersAndGuild() {
        Guild guild = new Guild();
        guild.setId(UUID.randomUUID());
        guild.setName("Legends");
        guild.setMembers(java.util.List.of(new GuildMember(UUID.randomUUID(), guild, GuildPosition.GUILD_MASTER)));

        when(guildRepository.findByNameIgnoreCase("Legends")).thenReturn(Optional.of(guild));

        adminService.disbandGuild("Legends");

        verify(guildMemberRepository).deleteAll(guild.getMembers());
        verify(guildRepository).delete(guild);
    }

    @Test
    void changeGuildMasterPromotesRequestedMemberAndDemotesPreviousMaster() {
        Guild guild = new Guild();
        guild.setId(UUID.randomUUID());
        guild.setName("Legends");

        Character newMasterCharacter = new Character();
        newMasterCharacter.setId(UUID.randomUUID());
        newMasterCharacter.setName("HeroTwo");

        GuildMember oldMaster = new GuildMember(UUID.randomUUID(), guild, GuildPosition.GUILD_MASTER);
        GuildMember newMasterMember = new GuildMember(newMasterCharacter.getId(), guild, GuildPosition.NORMAL);
        GuildDTO guildDTO = new GuildDTO();

        when(guildRepository.findByNameIgnoreCase("Legends")).thenReturn(Optional.of(guild));
        when(characterService.getCharacterByNameOrThrow("HeroTwo")).thenReturn(newMasterCharacter);
        when(guildMemberRepository.findByGuildIdAndId(guild.getId(), newMasterCharacter.getId()))
                .thenReturn(Optional.of(newMasterMember));
        when(guildMemberRepository.findByGuildIdAndStatus(guild.getId(), GuildPosition.GUILD_MASTER))
                .thenReturn(Optional.of(oldMaster));
        when(guildService.getGuildByName("Legends")).thenReturn(guildDTO);

        GuildDTO result = adminService.changeGuildMaster("Legends", new ChangeGuildMasterDTO("HeroTwo"));

        assertEquals(guildDTO, result);
        assertEquals(GuildPosition.NORMAL, oldMaster.getStatus());
        assertEquals(GuildPosition.GUILD_MASTER, newMasterMember.getStatus());
        verify(guildMemberRepository).save(oldMaster);
        verify(guildMemberRepository).save(newMasterMember);
    }

    @Test
    void checkAdminPrivilegesAllowsSuperAdminRole() {
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "root-user", "role", "SUPER_ADMIN")
        );

        adminService.checkAdminPrivileges(principal);
    }

    @Test
    void checkSuperAdminPrivilegesRejectsGameMasterRole() {
        Jwt principal = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of("sub", "gm-user", "role", "GAME_MASTER")
        );

        assertThrows(ForbiddenException.class, () -> adminService.checkSuperAdminPrivileges(principal));
    }
}
