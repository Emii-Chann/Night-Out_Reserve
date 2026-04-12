package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "szorakozohelyek")
@Getter // Ez automatikusan legenerálja az összes gettert a háttérben
@Setter 
public class Szorakozohely {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    // Hozzáadva a pontos oszlopnév
    @ManyToOne
    @JoinColumn(name = "tulaj_id") // Ennek az oszlopnak lennie kell a 'szorakozohelyek' tábládban!
    @JsonIgnoreProperties({"letrehozvaAt"}) // Ezeket nem küldjük ki feleslegesen a frontendnek
    private TulajokAdatai tulajokAdatai;
    
    private String varos;
    private String nev;
    private String cim;
    private String leiras;
    private String nyitvatartas;
    private String keputvonal;
    
    // Hozzáadva a pontos oszlopnév
    @Column(name = "asztalok_szama")
    private Integer asztalokSzama;
    
    @Column(name = "letrehozva_at", insertable = false, updatable = false)
    private LocalDateTime letrehozvaAt;
    
    // Hozzáadva a pontos oszlopnév
    @Column(name = "torolve_at")
    private LocalDateTime torolveAt;

    


}