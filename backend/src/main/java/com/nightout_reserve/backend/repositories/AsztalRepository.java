package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.AsztalFoglalas;

public interface AsztalRepository extends JpaRepository<Asztal, Integer> {
    
    // Lekéri egy adott szórakozóhely összes asztalát
    List<Asztal> findBySzorakozohelyId(Integer szorakozohelyId);

}