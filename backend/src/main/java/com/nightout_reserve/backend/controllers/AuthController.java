package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.dto.UserLoginDTO;
import com.nightout_reserve.backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginDTO ulDTO) {
        try {
            String token = authService.login(ulDTO);
            return ResponseEntity.ok(token); // Return JWT token directly
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // TODO: this is the example controller, other /auth APIs will be here...
}