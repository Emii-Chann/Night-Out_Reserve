package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

import com.nightout_reserve.backend.models.JatekFoglalas;

public interface JatekFoglalasRepository extends JpaRepository<JatekFoglalas, Integer> {

}