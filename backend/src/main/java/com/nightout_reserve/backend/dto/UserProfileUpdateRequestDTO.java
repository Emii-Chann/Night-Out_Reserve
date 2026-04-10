package com.nightout_reserve.backend.dto; // A te csomagneved

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequestDTO {
    private Integer id;
    private String nev;     // ⚠️ Ha a Java User modelledben 'teljesNev' van, akkor itt is azt írd!
    private String email;
    private String telefon; // ⚠️ Ha a Java User modelledben 'telefonszam' van, itt is azt írd!
}