package io.github.felipeemerson.openmuapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManageableServerDTO {

    private int id;

    private UUID configurationId;

    private String description;

    private String type;

    private String serverState;

    private int currentConnections;

    private int maximumConnections;
}
