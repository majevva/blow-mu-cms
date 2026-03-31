package io.github.felipeemerson.openmuapi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminTeleportDTO {

    @NotBlank
    private String mapName;

    @Min(0)
    @Max(255)
    private short x;

    @Min(0)
    @Max(255)
    private short y;
}
