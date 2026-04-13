
package com.nightout_reserve.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegistrationDTO {

    @NotBlank(message = "A felhasználónév nem lehet üres")
    @Size(min = 4, max = 20, message = "A felhasználónév 4-20 karakter között legyen")
    private String username;

    @NotBlank(message = "Az email nem lehet üres")
    @Email(message = "Érvénytelen email formátum")
    private String email;

    @NotBlank(message = "A telefonszám nem lehet üres")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "A telefonszám 9-12 számjegyből álljon")
    private String phone;

    @NotBlank(message = "A jelszó nem lehet üres")
    @Size(min = 8, message = "A jelszónak legalább 8 karakternek kell lennie")
    @Pattern(regexp = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$", message = "Helytelen jelszó (minimum 1 nagy-kisbetű és 1 szám)")
    private String password;
}