package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Table(name = "hely_foglalasok")
@Getter
@Setter
public class HelyFoglalas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hely_foglalas_id")
    private Integer id;

    @Column(name = "felhasznalo_id")
    private Integer felhasznaloId;

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    private Integer letszam;
    private LocalDateTime kezdet;
    private LocalDateTime vege;
    private String allapot;
    private String megjegyzes;

    @Column(name = "letrehozva_at", insertable = false, updatable = false)
    private LocalDateTime letrehozvaAt;

    @PrePersist
    protected void onCreate() {
        this.letrehozvaAt = LocalDateTime.now();
    }
}