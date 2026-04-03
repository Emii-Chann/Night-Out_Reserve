//package com.nightout_reserve.backend.models;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotNull;
//import lombok.Getter;
//import lombok.Setter;
//import org.hibernate.annotations.ColumnDefault;
//import org.hibernate.annotations.OnDelete;
//import org.hibernate.annotations.OnDeleteAction;
//
//import java.time.Instant;
//
//@Getter
//@Setter
//@Entity
//@Table(name = "hely_foglalasok")
//public class HelyFoglalasok {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "hely_foglalas_id", nullable = false)
//    private Integer id;
//
//    @NotNull
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @OnDelete(action = OnDeleteAction.CASCADE)
//    @JoinColumn(name = "szorakozohely_id", nullable = false)
//    private Venue venue;
//
//    @NotNull
//    @Column(name = "letszam", nullable = false)
//    private Integer letszam;
//
//    @NotNull
//    @Column(name = "kezdet", nullable = false)
//    private Instant kezdet;
//
//    @NotNull
//    @Column(name = "vege", nullable = false)
//    private Instant vege;
//
//    @NotNull
//    @ColumnDefault("'FÜGGŐ'")
//    @Lob
//    @Column(name = "allapot", nullable = false)
//    private String allapot;
//
//    @Lob
//    @Column(name = "megjegyzes")
//    private String megjegyzes;
//
//    @NotNull
//    @ColumnDefault("CURRENT_TIMESTAMP")
//    @Column(name = "letrehozva_at", nullable = false)
//    private Instant letrehozvaAt;
//
//    @Column(name = "torolve_at")
//    private Instant torolveAt;
//
//}