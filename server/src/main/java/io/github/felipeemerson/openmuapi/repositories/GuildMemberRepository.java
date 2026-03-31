package io.github.felipeemerson.openmuapi.repositories;

import io.github.felipeemerson.openmuapi.entities.GuildMember;
import io.github.felipeemerson.openmuapi.enums.GuildPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuildMemberRepository extends JpaRepository<GuildMember, UUID> {
    Optional<GuildMember> findByGuildIdAndId(UUID guildId, UUID characterId);
    Optional<GuildMember> findByGuildIdAndStatus(UUID guildId, GuildPosition status);
}
