package io.github.felipeemerson.openmuapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeGuildMasterDTO {

    @NotBlank
    private String newMasterCharacterName;
}
