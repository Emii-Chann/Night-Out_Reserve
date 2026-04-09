package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.nightout_reserve.backend.models.AsztalFoglalas;

public interface AsztalFoglalasRepository extends JpaRepository<AsztalFoglalas, Integer> {

    // 1. Ütközésvizsgálat a dupla foglalások elkerülésére
    @Query(value = "SELECT COUNT(*) FROM asztal_foglalasok WHERE szorakozohely_id = :helyId AND asztal_szam = :asztalSzam AND kezdet < :ujVege AND vege > :ujKezdet AND allapot != 'TÖRÖLVE'", nativeQuery = true)
    int countUtkozesek(@Param("helyId") Integer helyId, @Param("asztalSzam") Integer asztalSzam, @Param("ujKezdet") LocalDateTime ujKezdet, @Param("ujVege") LocalDateTime ujVege);

    // 2. A felhasználó saját foglalásainak lekérdezése a profil oldalhoz
    List<AsztalFoglalas> findByFelhasznaloId(Integer felhasznaloId);


    List<AsztalFoglalas> findBySzorakozohelyId(Integer szorakozohelyId); 

@Query("SELECT af FROM AsztalFoglalas af WHERE af.szorakozohelyId = :helyId " +
       "AND af.asztalSzam = :asztalSzam " +
       "AND af.allapot IN (com.nightout_reserve.backend.enums.Allapot.FUGGO, com.nightout_reserve.backend.enums.Allapot.JOVAHAGYVA) " +
       "AND CAST(af.kezdet AS date) = :datum")
List<AsztalFoglalas> findFoglalasokAdottNapon(
    @Param("helyId") Integer helyId, 
    @Param("asztalSzam") Integer asztalSzam, 
    @Param("datum") LocalDate datum
);
}