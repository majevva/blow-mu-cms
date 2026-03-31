package io.github.felipeemerson.openmuapi.dto;

import io.github.felipeemerson.openmuapi.enums.AccountState;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AccountStateChangeDTO {
    private AccountState state;
}
