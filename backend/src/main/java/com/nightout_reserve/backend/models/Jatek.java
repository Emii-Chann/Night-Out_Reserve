package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



@Entity
@Table(name = "jatekok")
@Getter
@Setter
public class Jatek {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer Id;

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Column(name = "nev")
    private String nev;


    @Column(name = "leiras")
    private String leiras;


    private Integer darab;
    
    @Column(name = "ar_ora")
    private Integer arOra;

    @Column(name = "min_idotartam_perc")
    private Integer minIdotartamPerc;

    
}