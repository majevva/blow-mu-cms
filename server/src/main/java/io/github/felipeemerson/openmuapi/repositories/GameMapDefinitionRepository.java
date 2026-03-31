package io.github.felipeemerson.openmuapi.repositories;

import io.github.felipeemerson.openmuapi.entities.GameMapDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameMapDefinitionRepository extends JpaRepository<GameMapDefinition, UUID> {

    Optional<GameMapDefinition> findByNameIgnoreCase(String name);
}
