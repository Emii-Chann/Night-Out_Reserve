package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "tulajokadatai") // ⚠️ Ellenőrizd a bal oldali menüdben, hogy tényleg ez-e a tábla neve!
@Getter
@Setter

public class TulajokAdatai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "teljes_nev")
    private String teljesNev;

    @Column(name = "email")
    private String email;

    @Column(name = "telefon")
    private String telefon;

    @Column(name = "letrehozva_at")
    private LocalDateTime letrehozvaAt;
    
}
