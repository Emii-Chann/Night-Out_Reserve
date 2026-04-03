package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;


@Entity
@Table(name = "jatekok")
@Getter
@Setter
public class Jatek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nev;

    private String leiras;
}