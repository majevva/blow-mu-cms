package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.BetaSocialLinksDTO;
import io.github.felipeemerson.openmuapi.entities.SocialMediaLink;
import io.github.felipeemerson.openmuapi.enums.SocialMediaPlatform;
import io.github.felipeemerson.openmuapi.repositories.SocialMediaLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class SocialMediaLinkService {

    private final SocialMediaLinkRepository socialMediaLinkRepository;

    public SocialMediaLinkService(@Autowired SocialMediaLinkRepository socialMediaLinkRepository) {
        this.socialMediaLinkRepository = socialMediaLinkRepository;
    }

    public BetaSocialLinksDTO getBetaSocialLinks() {
        Map<SocialMediaPlatform, String> links = new EnumMap<>(SocialMediaPlatform.class);

        this.socialMediaLinkRepository.findAll().forEach(link -> links.put(link.getPlatform(), normalizeUrl(link.getUrl())));

        return new BetaSocialLinksDTO(
                links.get(SocialMediaPlatform.INSTAGRAM),
                links.get(SocialMediaPlatform.DISCORD),
                links.get(SocialMediaPlatform.FACEBOOK),
                links.get(SocialMediaPlatform.YOUTUBE)
        );
    }

    public BetaSocialLinksDTO updateBetaSocialLinks(BetaSocialLinksDTO dto) {
        List<SocialMediaLink> links = List.of(
                new SocialMediaLink(SocialMediaPlatform.INSTAGRAM, normalizeUrl(dto.getInstagramUrl())),
                new SocialMediaLink(SocialMediaPlatform.DISCORD, normalizeUrl(dto.getDiscordUrl())),
                new SocialMediaLink(SocialMediaPlatform.FACEBOOK, normalizeUrl(dto.getFacebookUrl())),
                new SocialMediaLink(SocialMediaPlatform.YOUTUBE, normalizeUrl(dto.getYoutubeUrl()))
        );

        this.socialMediaLinkRepository.saveAll(links);

        return this.getBetaSocialLinks();
    }

    private String normalizeUrl(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
