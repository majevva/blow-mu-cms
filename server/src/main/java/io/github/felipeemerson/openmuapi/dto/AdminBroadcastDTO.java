package io.github.felipeemerson.openmuapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBroadcastDTO {

    @NotBlank
    private String message;

    @NotNull
    private Integer serverId;
}
