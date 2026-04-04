package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.TulajBelepes;
import com.nightout_reserve.backend.services.TulajBelepesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Nagyon fontos, hogy a frontend hozzáférjen!
public class AdminAuthController {

    @Autowired
    private TulajBelepesService tulajBelepesService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            // A JavaScriptből ezeken a neveken várjuk az adatokat
            String email = credentials.get("email");
            String jelszo = credentials.get("password");

            // Rábízzuk a Service-re a munkát
            TulajBelepes loggedInAdmin = tulajBelepesService.login(email, jelszo);
            
            return ResponseEntity.ok(loggedInAdmin);

        } catch (RuntimeException e) {
            // Ha a Service hibát dob (pl. rossz jelszó), itt elkapjuk és visszaküldjük a frontednek
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/jelszo-modositas")
    public ResponseEntity<?> jelszoModositas(@RequestBody Map<String, String> body) {
    try {
        Integer id = Integer.parseInt(body.get("id"));
        String regi = body.get("regiJelszo");
        String uj = body.get("ujJelszo");

        tulajBelepesService.jelszoModositas(id, regi, uj);
        return ResponseEntity.ok().body("Jelszó sikeresen megváltoztatva!");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}

}