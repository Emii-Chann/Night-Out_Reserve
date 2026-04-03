package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.nightout_reserve.backend.models.JatekFoglalas;

public interface JatekFoglalasRepository extends JpaRepository<JatekFoglalas, Integer> {

    List<JatekFoglalas> findByFelhasznaloId(Integer felhasznaloId);

    @Query(value = "SELECT COUNT(*) FROM jatek_foglalasok WHERE szorakozohely_id = :helyId AND jatek_id = :jatekId AND kezdet < :ujVege AND vege > :ujKezdet AND allapot != 'TÖRÖLVE'", nativeQuery = true)
    int countUtkozesek(@Param("helyId") Integer helyId, @Param("jatekId") Integer jatekId, @Param("ujKezdet") LocalDateTime ujKezdet, @Param("ujVege") LocalDateTime ujVege);
}