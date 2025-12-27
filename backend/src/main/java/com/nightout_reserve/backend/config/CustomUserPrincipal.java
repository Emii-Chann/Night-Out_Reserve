package com.nightout_reserve.backend.config;

import lombok.Getter;

public class CustomUserPrincipal {
    @Getter
    private final String username;
    @Getter
    private final Integer userId;

    public CustomUserPrincipal(String username, Integer userId) {
        this.username = username;
        this.userId = userId;
    }
}