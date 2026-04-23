package com.nightout_reserve.backend.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Map;


import java.util.List;

import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.models.Szorakozohely;

@Repository
public interface SzorakozohelyRepository extends JpaRepository<Szorakozohely, Integer> {

    
    
    
    List<Szorakozohely> findByTorolveAtIsNull();

@Query(value = "SELECT id AS jatekId, nev AS nev, ar_ora AS arOra " +
                   "FROM jatekok " +
                   "WHERE szorakozohely_id = :helyId", nativeQuery = true)
    List<Map<String, Object>> findJatekokByHelyId(@Param("helyId") Integer helyId);

    @Query(value = "SELECT asztal_szam, ferohely FROM asztalok WHERE szorakozohely_id = :helyId", nativeQuery = true)
    List<Map<String, Object>> findAsztalokByHelyId(@Param("helyId") Integer helyId);


List<Szorakozohely> findByTulajokAdataiIdAndTorolveAtIsNull(Integer tulajId);
    

}