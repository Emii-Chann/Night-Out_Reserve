package com.nightout_reserve.backend.models;

import java.time.LocalDateTime; 

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "felhasznalok")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name="nev", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name="email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name="telefon", unique = true, length = 30)
    private String phone;

    @Column(name="jelszo", nullable = false, length = 60)
    private String password;

    @Column(name = "letrehozva_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "torolve", nullable = false)
    private Boolean isDeleted;

    @Column(name = "torolve_at")
    private LocalDateTime deletedAt;



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