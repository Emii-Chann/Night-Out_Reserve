package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "szorakozohelyek")
public class Szorakozohely {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer tulajId;
    private String nev;
    private String cim;
    private String leiras;
    private String nyitvatartas;
    private Integer asztalokSzama;
    
    @Column(name = "letrehozva_at", insertable = false, updatable = false)
    private LocalDateTime letrehozvaAt;
    
    private LocalDateTime torolveAt;

    // Getterek és Setterek...
}