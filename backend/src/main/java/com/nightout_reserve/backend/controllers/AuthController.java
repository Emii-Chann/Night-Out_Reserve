package com.nightout_reserve.backend.controllers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.dto.UserLoginDTO;
import com.nightout_reserve.backend.models.PasswordResetRequest;
import com.nightout_reserve.backend.models.PasswordResetToken;
import com.nightout_reserve.backend.models.User;
import com.nightout_reserve.backend.repositories.PasswordResetTokenRepository;
import com.nightout_reserve.backend.repositories.UserRepository;
import com.nightout_reserve.backend.services.AuthService;

import jakarta.validation.Valid;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {


    
    @Autowired
    private AuthService authService;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginDTO ulDTO) {
        try {
            String token = authService.login(ulDTO);
            return ResponseEntity.ok(token); // Return JWT token directly
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        
        // 1. Megkeressük az embert az email alapján
        User user = userRepository.findByEmail(request.getEmail());        
        if (user == null) {
            // Ha nincs ilyen email az adatbázisban
            return ResponseEntity.status(404).body("Nem található felhasználó ezzel az email címmel!");
        }
        
        // 2. Beállítjuk az új jelszót
        // ⚠️ FONTOS: Ha használsz jelszó titkosítást (BCryptPasswordEncoder), akkor itt titkosítva mentsd el!
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    
        
        // 3. Elmentjük az adatbázisba
        userRepository.save(user);
        
        return ResponseEntity.ok("Sikeres jelszóváltoztatás!");
    }



@Autowired
private PasswordResetTokenRepository passwordResetTokenRepository;
@PostMapping("/auth/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
    String token = body.get("token");
    String ujJelszo = body.get("newPassword");

    if (token == null || ujJelszo == null) {
        return ResponseEntity.badRequest().body("Hiányzó adatok!");
    }

    // 1. Megkeressük a tokent az adatbázisban
    Optional<PasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(token);
    
    if (resetTokenOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Érvénytelen vagy nem létező token!");
    }

    PasswordResetToken resetToken = resetTokenOpt.get();

    // 2. Ellenőrizzük, hogy nem járt-e le (ha van lejárati időd)
    if (resetToken.getLejarat().isBefore(LocalDateTime.now())) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("A jelszó-visszaállító link lejárt!");
    }

    // 3. Megkeressük a tulajdonost és frissítjük a jelszavát
    User felhasznalo = resetToken.getFelhasznalo(); // <--- ITT
    
    // BCrypt-tel kódoljuk az új jelszót!
    felhasznalo.setPassword(passwordEncoder.encode(ujJelszo));
    
    // Mentsük el az új jelszót a te repository-ddal (pl. felhasznalokRepository)
    userRepository.save(felhasznalo); // <--- ITT

    // 4. Töröljük a felhasznált tokent
    passwordResetTokenRepository.delete(resetToken);

    return ResponseEntity.ok("Sikeres jelszócsere!");
}

    
}