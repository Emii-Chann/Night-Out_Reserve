package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;

@RestController
@RequestMapping("/api/helyfoglalas")
@CrossOrigin(origins = "*")
public class HelyFoglalasController {

    @Autowired
    private HelyFoglalasRepository repo;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody HelyFoglalas ujFoglalas) {
        
        // 1. Ütközés ellenőrzése az adatbázisban
        int utkozesek = repo.countUtkozesek(ujFoglalas.getSzorakozohelyId(), ujFoglalas.getKezdet(), ujFoglalas.getVege());

        if (utkozesek > 0) {
            // Ha van ütközés, HTTP 409-es (Conflict) hibakóddal visszadobjuk
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Sajnos ebben az időpontban a helyszín már foglalt!");
        }

        // 2. Ha nincs ütközés, jöhet a mentés
        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot("FOGLALVA");
        }
        
        repo.save(ujFoglalas);
        // HTTP 200 (OK) a sikeres mentésnél
        return ResponseEntity.ok("Sikeres helyfoglalás!"); 
    }
}