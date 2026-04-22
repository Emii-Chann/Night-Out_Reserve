package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;

import com.nightout_reserve.backend.enums.Allapot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;




@Entity
@Table(name = "asztal_foglalasok")
@Getter
@Setter
public class AsztalFoglalas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asztal_foglalas_id")
    private Integer id;

    @Column(name = "felhasznalo_id")
    private Integer felhasznaloId;

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Column(name = "asztal_szam")
    private Integer asztalSzam;

    private Integer letszam;
    private LocalDateTime kezdet;
    private LocalDateTime vege;

    @Transient
    private String szorakozohelyNev;
    @Transient
    private String felhasznaloNev;



    @Enumerated(EnumType.STRING)
    @Column(name = "allapot")
    private Allapot allapot;

    @Column(name = "letrehozva_at", insertable = false, updatable = false)
    private LocalDateTime letrehozvaAt;

    @Column(name = "torolve_at")
    private LocalDateTime torolveAt;

    @PrePersist
    protected void onCreate() {
        this.letrehozvaAt = LocalDateTime.now();
    }
}