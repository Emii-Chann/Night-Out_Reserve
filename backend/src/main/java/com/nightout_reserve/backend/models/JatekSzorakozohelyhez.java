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
//@Getter
//@Setter
//@Entity
//@Table(name = "jatek_szorakozohelyhez")
//public class JatekSzorakozohelyhez {
//    @EmbeddedId
//    private JatekSzorakozohelyhezId id;
//
//    @MapsId
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @OnDelete(action = OnDeleteAction.CASCADE)
////    @JoinColumn(name = "szorakozohely_id", nullable = false)
////    private Venue szorakozohely;
//
//    @NotNull
//    @ColumnDefault("1")
//    @Column(name = "darab", nullable = false)
//    private Integer darab;
//
//    @Column(name = "ar_ora")
//    private Integer arOra;
//
//    @NotNull
//    @ColumnDefault("60")
//    @Column(name = "min_idotartam_perc", nullable = false)
//    private Integer minIdotartamPerc;
//
//}