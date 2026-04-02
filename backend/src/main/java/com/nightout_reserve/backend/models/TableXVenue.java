package com.nightout_reserve.backend.models;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "asztalokxszorakozohelyek")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TableXVenue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;





}
