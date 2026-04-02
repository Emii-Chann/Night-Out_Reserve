package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "szorakozohelyek")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tulaj_id", nullable = false, insertable = false)
    private Owner owner;

    @Column(name = "nev", nullable = false, length = 120)
    private String name;

    @Column(name = "cim", nullable = false, length = 200)
    private String address;

    @Column(name = "varos", nullable = false, length = 80)
    private String location;

    @Lob
    @Column(name = "leiras")
    private String description;

    @Column(name = "nyitvatartas", length = 200)
    private String openingHours;

    @Column(name = "letrehozva_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "torolve")
    private Boolean isDeleted;

    @Column(name = "torolve_at")
    private LocalDateTime deletedat;


    @PrePersist
    void onCreate(){
        this.createdAt = LocalDateTime.now();

        if(isDeleted == null || isDeleted){
            isDeleted = true;
        } else {
            isDeleted = false;
        }

    }


}