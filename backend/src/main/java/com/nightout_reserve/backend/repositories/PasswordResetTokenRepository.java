package com.nightout_reserve.backend.repositories;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nightout_reserve.backend.models.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}