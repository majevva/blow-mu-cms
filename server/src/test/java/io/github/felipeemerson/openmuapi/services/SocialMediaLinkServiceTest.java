package io.github.felipeemerson.openmuapi.services;

import io.github.felipeemerson.openmuapi.dto.BetaSocialLinksDTO;
import io.github.felipeemerson.openmuapi.entities.SocialMediaLink;
import io.github.felipeemerson.openmuapi.enums.SocialMediaPlatform;
import io.github.felipeemerson.openmuapi.repositories.SocialMediaLinkRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialMediaLinkServiceTest {

    @Mock
    private SocialMediaLinkRepository socialMediaLinkRepository;

    @InjectMocks
    private SocialMediaLinkService socialMediaLinkService;

    @Test
    void getBetaSocialLinksMapsStoredPlatformsIntoDto() {
        when(socialMediaLinkRepository.findAll()).thenReturn(List.of(
                new SocialMediaLink(SocialMediaPlatform.DISCORD, "https://discord.gg/blowmu"),
                new SocialMediaLink(SocialMediaPlatform.YOUTUBE, "https://youtube.com/@blowmu")
        ));

        var result = socialMediaLinkService.getBetaSocialLinks();

        assertNull(result.getInstagramUrl());
        assertEquals("https://discord.gg/blowmu", result.getDiscordUrl());
        assertNull(result.getFacebookUrl());
        assertEquals("https://youtube.com/@blowmu", result.getYoutubeUrl());
    }

    @Test
    void updateBetaSocialLinksNormalizesBlankUrlsToNullAndReturnsFreshState() {
        BetaSocialLinksDTO payload = new BetaSocialLinksDTO(
                " https://instagram.com/blowmu ",
                "   ",
                null,
                "https://youtube.com/@blowmu"
        );

        when(socialMediaLinkRepository.findAll()).thenReturn(List.of(
                new SocialMediaLink(SocialMediaPlatform.INSTAGRAM, "https://instagram.com/blowmu"),
                new SocialMediaLink(SocialMediaPlatform.DISCORD, null),
                new SocialMediaLink(SocialMediaPlatform.FACEBOOK, null),
                new SocialMediaLink(SocialMediaPlatform.YOUTUBE, "https://youtube.com/@blowmu")
        ));

        var result = socialMediaLinkService.updateBetaSocialLinks(payload);

        ArgumentCaptor<List<SocialMediaLink>> captor = ArgumentCaptor.forClass(List.class);
        verify(socialMediaLinkRepository).saveAll(captor.capture());

        List<SocialMediaLink> savedLinks = captor.getValue();
        assertEquals(4, savedLinks.size());
        assertEquals("https://instagram.com/blowmu", savedLinks.get(0).getUrl());
        assertNull(savedLinks.get(1).getUrl());
        assertNull(savedLinks.get(2).getUrl());
        assertEquals("https://youtube.com/@blowmu", savedLinks.get(3).getUrl());

        assertEquals("https://instagram.com/blowmu", result.getInstagramUrl());
        assertNull(result.getDiscordUrl());
        assertNull(result.getFacebookUrl());
        assertEquals("https://youtube.com/@blowmu", result.getYoutubeUrl());
    }
}
