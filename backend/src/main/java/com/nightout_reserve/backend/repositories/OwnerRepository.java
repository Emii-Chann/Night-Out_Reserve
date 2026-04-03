package com.nightout_reserve.backend.repositories;

import com.nightout_reserve.backend.models.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
    Owner findByEmail(String email);

    Owner getOwnerByPhone(String phone);

    @Query("SELECT o FROM Owner o WHERE o.username LIKE %:username%")
    List<Owner> findByUsernameLike(String username);
}


