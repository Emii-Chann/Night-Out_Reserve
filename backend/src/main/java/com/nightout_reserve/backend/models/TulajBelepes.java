package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tulajokbelepes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TulajBelepes {

    @Id
    @Column(name = "tulaj_id")
    private Integer tulajId;

    @Column(name = "felhasznalonev", nullable = false)
    private String felhasznalonev;

    @Column(name = "jelszo", nullable = false)
    private String jelszo;

    @Column(name = "szorakozohely_id")
    private Integer szorakozohelyId;

    @Column(name = "utolso_belepes")
    private LocalDateTime utolsoBelepes;


    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "tulaj_id") 
    private List<Szorakozohely> szorakozohelyek;


    public List<Szorakozohely> getSzorakozohelyek() {
    return szorakozohelyek;
}

public void setSzorakozohelyek(List<Szorakozohely> szorakozohelyek) {
    this.szorakozohelyek = szorakozohelyek;
}
}