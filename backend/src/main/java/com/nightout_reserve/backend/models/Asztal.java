package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;


@Entity
@Table(name = "asztalok") // Vagy ahogy a MySQL-ben elnevezted a fizikai asztalok tábláját
@Getter
@Setter
public class Asztal {

    

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Id
    @Column(name = "asztal_szam")
    private Integer asztalSzam;

    private Integer ferohely;
}