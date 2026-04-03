package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nightout_reserve.backend.models.Jatek;

public interface JatekRepository extends JpaRepository<Jatek, Integer> {
}