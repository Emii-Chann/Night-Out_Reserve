package com.nightout_reserve.backend.dto; 

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequestDTO {
    private Integer id;
    private String nev;     
    private String email;
    private String telefon; 
}