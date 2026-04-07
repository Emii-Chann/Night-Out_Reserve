package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.JatekSzorakozohelyhez;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JatekHelyszinRepository extends JpaRepository<JatekSzorakozohelyhez, Integer> {

    Optional<JatekSzorakozohelyhez> findBySzorakozohelyIdAndJatekId(Integer szorakozohelyId, Integer jatekId);
}