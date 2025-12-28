package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.dto.UserLoginDTO;
import com.nightout_reserve.backend.exceptions.UserIsDeletedExistsException;
import com.nightout_reserve.backend.exceptions.UserNonExistsException;
import com.nightout_reserve.backend.exceptions.UserWrongPasswordException;
import com.nightout_reserve.backend.modules.UserProfiles;
import com.nightout_reserve.backend.repositories.UserProfilesRepository;
import com.nightout_reserve.backend.utils.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserProfilesRepository upRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserProfilesRepository upRepo, JwtUtil jwtUtil) {
        this.upRepo = upRepo;
        this.encoder = new BCryptPasswordEncoder(12);
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public String login(UserLoginDTO ulDTO) {
        UserProfiles up = upRepo.login(ulDTO.getUsernameIn());

        if (up == null) {
            throw new UserNonExistsException("A felhasználó nem létezik");
        }
        if (up.getDeletedAt() != null) {
            throw new UserIsDeletedExistsException("A felhasználó már nem létezik");
        }
        if (!encoder.matches(ulDTO.getPasswordIn(), up.getPassword())) {
            throw new UserWrongPasswordException("A jelszó hibás");
        }

        // Generate JWT token with username and userId
        return jwtUtil.generateToken(up.getUsername(), up.getId());
    }

    // TODO: other auth related services here
}