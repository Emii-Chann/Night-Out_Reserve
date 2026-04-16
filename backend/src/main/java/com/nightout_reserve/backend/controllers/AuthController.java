package com.nightout_reserve.backend.controllers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.dto.UserLoginDTO;
import com.nightout_reserve.backend.models.PasswordResetToken;
import com.nightout_reserve.backend.models.User;
import com.nightout_reserve.backend.repositories.PasswordResetTokenRepository;
import com.nightout_reserve.backend.repositories.UserRepository;
import com.nightout_reserve.backend.services.AuthService;
import com.nightout_reserve.backend.services.EmailService;

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





@Autowired
private PasswordResetTokenRepository passwordResetTokenRepository;
@PostMapping("/reset-password")
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



@Autowired
private EmailService emailService;




@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
    String email = body.get("email");

    // Mivel a te repository-d sima User-t ad vissza (nem Optional-t):
    User felhasznalo = userRepository.findByEmail(email);
    
    // Így az ellenőrzés is változik:
    if (felhasznalo == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nincs ilyen e-mail címmel regisztrált felhasználó!");
    }

    // 2. Generálunk egy egyedi tokent
    String token = UUID.randomUUID().toString();

    // 3. Elmentjük a tokent
    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setToken(token);
    resetToken.setFelhasznalo(felhasznalo); // Itt figyelj: a PasswordResetToken osztályban is Felhasznalo vagy User a mező neve?
    resetToken.setLejarat(LocalDateTime.now().plusHours(1));

    passwordResetTokenRepository.save(resetToken);

    // 4. Link összeállítása
    String resetLink = "https://nigth-out-reserve.org/jelszo-csere.html?token=" + token;

    // 5. E-mail küldése
    try {
      emailService.sendResetEmail(felhasznalo.getEmail(), token);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Hiba az e-mail küldésekor!");
    }

    return ResponseEntity.ok("E-mail elküldve!");
}

@GetMapping("/test")
public String test() {
    return "A backend lát engem!";
}
    
}