package io.github.felipeemerson.openmuapi.repositories;

import io.github.felipeemerson.openmuapi.entities.SocialMediaLink;
import io.github.felipeemerson.openmuapi.enums.SocialMediaPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocialMediaLinkRepository extends JpaRepository<SocialMediaLink, SocialMediaPlatform> {
}
