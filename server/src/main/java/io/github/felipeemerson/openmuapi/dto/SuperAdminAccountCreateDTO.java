package io.github.felipeemerson.openmuapi.dto;

import io.github.felipeemerson.openmuapi.enums.AccountState;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuperAdminAccountCreateDTO {

    @NotBlank
    @Size(min = 3, max = 10)
    private String loginName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 3, max = 20)
    private String password;

    @NotBlank
    @Size(min = 3, max = 10)
    private String securityCode;

    @NotNull
    private AccountState state;
}
