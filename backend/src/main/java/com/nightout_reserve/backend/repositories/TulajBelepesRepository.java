package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.TulajBelepes;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TulajBelepesRepository extends JpaRepository<TulajBelepes, Integer> {
    Optional<TulajBelepes> findByFelhasznalonev(String felhasznalonev);
}