package com.nightout_reserve.backend.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.dto.UserLoginDTO;
import com.nightout_reserve.backend.models.PasswordResetRequest;
import com.nightout_reserve.backend.models.User;
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

    @PostMapping("/auth/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    // 1. Megkeresed a tulajt az email alapján
    // 2. Generálsz egy tokent: String token = UUID.randomUUID().toString();
    // 3. Elmented a PasswordResetTokenRepository-val
    // 4. emailService.sendResetEmail(email, token);
    return ResponseEntity.ok("Email elküldve!");
}

@PostMapping("/auth/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
    String token = body.get("token");
    String ujJelszo = body.get("newPassword");
    // 1. Megkeresed a tokent a repository-ban
    // 2. Ellenőrzöd, hogy nem járt-e le
    // 3. Ha jó, BCrypt-tel kódolod az új jelszót és elmented a tulajdonosnál
    // 4. Törlöd a tokent az adatbázisból
    return ResponseEntity.ok("Sikeres jelszócsere!");
}

    
}