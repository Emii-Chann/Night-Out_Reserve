package com.nightout_reserve.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public class UserLoginDTO {
    @NotNull
    @Size(min = 6, max = 12, message = "A felhasználónév 6-12 karakter hosszú")
    @Getter @Setter
    private String usernameIn;

    @NotNull
    @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]+$", message="Helytelen jelszó (minimum 1 nagy-kisbetű és 1 szám)")
    @Size(min = 8, message = "A jelszavad legyen legalább 8 karakter")
    @Getter @Setter
    private String passwordIn;
}
