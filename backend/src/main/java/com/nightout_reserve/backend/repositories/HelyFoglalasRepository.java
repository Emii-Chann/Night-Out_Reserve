package com.nightout_reserve.backend.repositories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.models.HelyFoglalas;

public interface HelyFoglalasRepository extends JpaRepository<HelyFoglalas, Integer> {


        List<HelyFoglalas> findByFelhasznaloId(Integer felhasznaloId);

        List<HelyFoglalas> findBySzorakozohelyId(Integer szorakozohelyId); 
        
// Értelemszerűen a JatekFoglalas-nál JatekFoglalas-t írj a kacsacsőrbe, stb.

    // Megszámolja, hány olyan foglalás van az adott helyen, ami időben átfedésben van az újjal
    @Query(value = "SELECT COUNT(*) FROM hely_foglalasok WHERE szorakozohely_id = :helyId AND kezdet < :ujVege AND vege > :ujKezdet AND allapot != 'TÖRÖLVE'", nativeQuery = true)
    int countUtkozesek(@Param("helyId") Integer helyId, @Param("ujKezdet") LocalDateTime ujKezdet, @Param("ujVege") LocalDateTime ujVege);


    @Query("SELECT hf FROM HelyFoglalas hf WHERE hf.szorakozohelyId = :helyId AND hf.torolveAt IS NULL AND hf.allapot IN ('FUGGO', 'JOVAHAGYVA') AND DATE(hf.kezdet) = :datum")
    List<HelyFoglalas> findFoglalasokAdottNapon(@Param("helyId") Integer helyId, @Param("datum") LocalDate datum);
}