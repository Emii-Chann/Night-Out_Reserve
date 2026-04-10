package com.nightout_reserve.backend.models; // Cseréld a te csomagnevedre!

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequest {
    private String email;
    private String newPassword;
}