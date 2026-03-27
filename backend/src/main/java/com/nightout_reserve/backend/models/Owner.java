package com.nightout_reserve.backend.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tulajokadatai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Owner {

    @Column(name = "id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "teljes_nev", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "jelszo", nullable = false, length = 15)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "telefon", nullable = false, length = 30)
    private String phone;

    @Column(name = "cegnev", length = 150)
    private String companyName;

    @Column(name = "torolve", nullable = false)
    private Boolean isDeleted;

    @Column(name = "torolve_at")
    private LocalDateTime deletedAt;

    @Column(name = "letrehozva_at", nullable = false)
    private LocalDateTime createdAt;

}
