package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Transient;


@Entity
@Getter
@Setter
@Table(name = "jatek_szorakozohelyhez") // Írd át a pontos táblanevedre!
public class JatekSzorakozohelyhez {
    @Id
    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Column(name = "jatek_id")
    private Integer jatekId;

    private Integer darab;
    
    @Column(name = "ar_ora")
    private Integer arOra;

    @Column(name = "min_idotartam_perc")
    private Integer minIdotartamPerc;

    // Getterek, Setterek...
}