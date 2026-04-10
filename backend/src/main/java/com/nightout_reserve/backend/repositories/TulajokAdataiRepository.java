package com.nightout_reserve.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.nightout_reserve.backend.models.TulajokAdatai;

@Repository
public interface TulajokAdataiRepository extends JpaRepository<TulajokAdatai, Integer> {
}