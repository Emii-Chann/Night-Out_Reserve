package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.Owner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
    Owner findByEmail(String email);

    Owner getOwnerByPhone(String phone);

    List<Owner> findByUsernameLike(String username);
}
