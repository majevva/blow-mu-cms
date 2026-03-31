package io.github.felipeemerson.openmuapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoggedInAccountDTO {

    private String loginName;

    private int serverId;
}
