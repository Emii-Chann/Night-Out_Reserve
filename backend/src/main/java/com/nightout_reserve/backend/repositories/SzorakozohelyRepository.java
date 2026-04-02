package com.nightout_reserve.backend.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.nightout_reserve.backend.models.Szorakozohely;

@Repository
public interface SzorakozohelyRepository extends JpaRepository<Szorakozohely, Integer> {

    // 1. Alapból tudja: findAll(), findById(), save(), delete()
    
    // 2. Egyedi lekérdezés: Csak azokat adjuk vissza, amik nincsenek törölve
    List<Szorakozohely> findByTorolveAtIsNull();


}