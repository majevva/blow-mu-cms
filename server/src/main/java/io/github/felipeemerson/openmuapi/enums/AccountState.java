package io.github.felipeemerson.openmuapi.enums;

import lombok.Getter;

@Getter
public enum AccountState {
    NORMAL(0),
    SPECTATOR(1),
    GAME_MASTER(2),
    GAME_MASTER_INVISIBLE(3),
    BANNED(4),
    TEMPORARILY_BANNED(5),
    SUPER_ADMIN(6);

    private int value;

    AccountState(int value) { this.value = value; }

    public boolean canAccessGameMasterPanel() {
        return this == GAME_MASTER || this == GAME_MASTER_INVISIBLE || this == SUPER_ADMIN;
    }

    public boolean canAccessSuperAdminPanel() {
        return this == SUPER_ADMIN;
    }

    public boolean canManageContent() {
        return this == GAME_MASTER || this == SUPER_ADMIN;
    }
}
