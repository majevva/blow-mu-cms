package io.github.felipeemerson.openmuapi.services;

import com.nimbusds.jose.shaded.gson.Gson;
import io.github.felipeemerson.openmuapi.configuration.SystemConstants;
import io.github.felipeemerson.openmuapi.dto.CharacterRankDTO;
import io.github.felipeemerson.openmuapi.dto.GameServerInfoDTO;
import io.github.felipeemerson.openmuapi.dto.LoggedInAccountDTO;
import io.github.felipeemerson.openmuapi.dto.ManageableServerDTO;
import io.github.felipeemerson.openmuapi.dto.OnlinePlayersDTO;
import io.github.felipeemerson.openmuapi.dto.ServerStatisticsDTO;
import io.github.felipeemerson.openmuapi.entities.Account;
import io.github.felipeemerson.openmuapi.entities.GameConfiguration;
import io.github.felipeemerson.openmuapi.entities.GameServerDefinition;
import io.github.felipeemerson.openmuapi.entities.GameServerEndpoint;
import io.github.felipeemerson.openmuapi.enums.AccountState;
import io.github.felipeemerson.openmuapi.exceptions.BadGatewayException;
import io.github.felipeemerson.openmuapi.exceptions.BadRequestException;
import io.github.felipeemerson.openmuapi.exceptions.ForbiddenException;
import io.github.felipeemerson.openmuapi.repositories.GameConfigurationRepository;
import io.github.felipeemerson.openmuapi.repositories.GameServerDefinitionRepository;
import io.github.felipeemerson.openmuapi.repositories.GameServerEndpointRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import static java.lang.Thread.sleep;

@Service
@Transactional
public class GameServerService {

    private final GameServerDefinitionRepository serverDefinitionRepository;
    private final GameServerEndpointRepository endpointRepository;
    private final GameConfigurationRepository gameConfigurationRepository;
    private final AccountService accountService;
    private final CharacterService characterService;
    private HttpEntity<?> adminApiClient;

    @Value("${admin.panel.username}")
    private String adminPanelUsername;

    @Value("${admin.panel.password}")
    private String adminPanelPassword;

    public GameServerService(@Autowired GameServerDefinitionRepository serverDefinitionRepository,
                             @Autowired GameServerEndpointRepository endpointRepository,
                             @Autowired GameConfigurationRepository gameConfigurationRepository,
                             @Autowired AccountService accountService,
                             @Autowired CharacterService characterService) {

        this.serverDefinitionRepository = serverDefinitionRepository;
        this.endpointRepository = endpointRepository;
        this.gameConfigurationRepository = gameConfigurationRepository;
        this.accountService = accountService;
        this.characterService = characterService;
    }

    @PostConstruct
    private void setUpAdminApiClient() {
        String authStr = String.format("%s:%s", adminPanelUsername, adminPanelPassword);
        String base64Creds = Base64.getEncoder().encodeToString(authStr.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + base64Creds);

        this.adminApiClient = new HttpEntity<>(headers);
    }

    public List<GameServerInfoDTO> getGameServerInfo() {
        List<GameServerDefinition> serverDefinitions = serverDefinitionRepository.findAll();
        return serverDefinitions.stream().map(serverDefinition -> {
            GameServerEndpoint endpoint = endpointRepository.findByGameServerDefinitionId(serverDefinition.getId());
            return new GameServerInfoDTO(
                    serverDefinition.getServerId(),
                    endpoint.getNetworkPort(),
                    serverDefinition.getDescription(),
                    serverDefinition.getExperienceRate(),
                    serverDefinition.getGameConfigurationId()
            );
        }).collect(Collectors.toList());
    }

    public GameConfiguration getGameConfiguration() {
        return gameConfigurationRepository.findFirstBy();
    }

    public OnlinePlayersDTO getOnlinePlayers() throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                SystemConstants.ADMIN_PANEL_URL + SystemConstants.ONLINE_PLAYERS_ENDPOINT,
                HttpMethod.GET,
                adminApiClient,
                String.class);

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }

        return new Gson().fromJson(response.getBody(), OnlinePlayersDTO.class);
    }

    public boolean isAccountOnline(String loginName) throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                String.format("%s%s/%s", SystemConstants.ADMIN_PANEL_URL, SystemConstants.IS_ACCOUNT_ONLINE_ENDPOINT, loginName),
                HttpMethod.GET,
                adminApiClient,
                String.class);

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }

        return Boolean.parseBoolean(response.getBody());
    }

    public List<LoggedInAccountDTO> getLoggedInAccounts() throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<LoggedInAccountDTO[]> response = restTemplate.exchange(
                SystemConstants.ADMIN_PANEL_URL + SystemConstants.LOGGED_IN_ACCOUNTS_ENDPOINT,
                HttpMethod.GET,
                adminApiClient,
                LoggedInAccountDTO[].class
        );

        if (response.getStatusCode().isError() || response.getBody() == null) {
            throw new BadGatewayException();
        }

        return Arrays.stream(response.getBody())
                .sorted((left, right) -> left.getLoginName().compareToIgnoreCase(right.getLoginName()))
                .toList();
    }

    public List<ManageableServerDTO> getManageableServers() throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<ManageableServerDTO[]> response = restTemplate.exchange(
                SystemConstants.ADMIN_PANEL_URL + SystemConstants.MANAGEABLE_SERVERS_ENDPOINT,
                HttpMethod.GET,
                adminApiClient,
                ManageableServerDTO[].class
        );

        if (response.getStatusCode().isError() || response.getBody() == null) {
            throw new BadGatewayException();
        }

        return Arrays.stream(response.getBody()).toList();
    }

    public List<CharacterRankDTO> getOnlinePlayersDetailed() throws BadGatewayException {
        return this.characterService.getPlayersByName(Arrays.asList(this.getOnlinePlayers().getPlayersList()));
    }

    public void sendServerMessage(String message, int serverId, String loginName) throws BadGatewayException {
        Account account = this.accountService.getAccountByLoginName(loginName);

        if (!account.getState().canAccessGameMasterPanel()) {
            throw new ForbiddenException("Restrict access");
        }

        int numberOfServers = this.getGameServerInfo().size();

        if (serverId < 0 || serverId >= numberOfServers) {
            throw new BadRequestException("Server id invalid.");
        }

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                String.format("%s%s/%s?msg=%s", SystemConstants.ADMIN_PANEL_URL, SystemConstants.SEND_MESSAGE_ENDPOINT, serverId, message),
                HttpMethod.GET,
                adminApiClient,
                String.class
        );

        if (response.getStatusCode().isError()){
            throw new BadGatewayException();
        }
    }

    public void disconnectCharacter(String characterName) throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        String encodedCharacterName = UriUtils.encodePathSegment(characterName, StandardCharsets.UTF_8);

        ResponseEntity<String> response = restTemplate.exchange(
                String.format(
                        "%s" + SystemConstants.DISCONNECT_CHARACTER_ENDPOINT,
                        SystemConstants.ADMIN_PANEL_URL,
                        encodedCharacterName
                ),
                HttpMethod.POST,
                adminApiClient,
                String.class
        );

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }
    }

    public void disconnectAccount(String loginName, int serverId) throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        String encodedLoginName = UriUtils.encodePathSegment(loginName, StandardCharsets.UTF_8);

        ResponseEntity<String> response = restTemplate.exchange(
                String.format(
                        "%s" + SystemConstants.DISCONNECT_ACCOUNT_ENDPOINT,
                        SystemConstants.ADMIN_PANEL_URL,
                        encodedLoginName,
                        serverId
                ),
                HttpMethod.POST,
                adminApiClient,
                String.class
        );

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }
    }

    public void startManageableServer(int serverId) throws BadGatewayException {
        this.invokeManageableServerLifecycle(
                String.format(
                        "%s" + SystemConstants.MANAGEABLE_SERVER_START_ENDPOINT,
                        SystemConstants.ADMIN_PANEL_URL,
                        serverId
                )
        );
    }

    public void stopManageableServer(int serverId) throws BadGatewayException {
        this.invokeManageableServerLifecycle(
                String.format(
                        "%s" + SystemConstants.MANAGEABLE_SERVER_STOP_ENDPOINT,
                        SystemConstants.ADMIN_PANEL_URL,
                        serverId
                )
        );
    }

    public void removeManageableServer(int serverId, String type) throws BadGatewayException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                String.format(
                        "%s" + SystemConstants.MANAGEABLE_SERVER_REMOVE_ENDPOINT,
                        SystemConstants.ADMIN_PANEL_URL,
                        serverId,
                        UriUtils.encodeQueryParam(type, StandardCharsets.UTF_8)
                ),
                HttpMethod.DELETE,
                adminApiClient,
                String.class
        );

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }
    }

    public void restartAllManageableServers() throws BadGatewayException {
        this.invokeManageableServerLifecycle(
                SystemConstants.ADMIN_PANEL_URL + SystemConstants.MANAGEABLE_SERVERS_RESTART_ALL_ENDPOINT
        );
    }

    private void invokeManageableServerLifecycle(String endpoint) {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                adminApiClient,
                String.class
        );

        if (response.getStatusCode().isError()) {
            throw new BadGatewayException();
        }
    }

    public ServerStatisticsDTO getStatistics() {
        ServerStatisticsDTO serverStatisticsDTO = this.gameConfigurationRepository.getStatistics();

        serverStatisticsDTO.setOnlines(this.getOnlinePlayers().getPlayers());

        return serverStatisticsDTO;
    }
 }
