package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Transient;


@Entity
@Table(name = "jatek_foglalasok")
@Getter
@Setter
public class JatekFoglalas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "jatek_foglalas_id")
    private Integer id; // Figyelj, itt az oszlop neve jatek_foglalas_id!

    @Column(name = "felhasznalo_id")
    private Integer felhasznaloId;

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Column(name = "jatek_id")
    private Integer jatekId;

    private LocalDateTime kezdet;
    
    private LocalDateTime vege;
    
    private String allapot;

    @Column(name = "letrehozva_at", insertable = false, updatable = false)
    private LocalDateTime letrehozvaAt;

    @Column(name = "torolve_at")
    private LocalDateTime torolveAt;

    @Transient
    private String szorakozohelyNev;

    @Transient
    private String jatekNev;

    @PrePersist
    protected void onCreate() {
    this.letrehozvaAt = LocalDateTime.now();
}
}