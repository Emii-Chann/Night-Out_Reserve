package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.services.HelyFoglalasService;

@RestController
@RequestMapping("/api/helyfoglalas")
@CrossOrigin(origins = "*")
public class HelyFoglalasController {

    @Autowired
    private HelyFoglalasService service;

    @Autowired
    private HelyFoglalasRepository helyFoglalasRepository;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody HelyFoglalas ujFoglalas) {
        try{
            service.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }
    

    @GetMapping("/felhasznalo/{id}")
    public List<HelyFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return service.getFelhasznaloFoglalasai(id);
    }


    @GetMapping("/foglalt-hely-idopontok") // ÚJ URL!
    public ResponseEntity<List<String>> getFoglaltHelyIdopontok(
            @RequestParam Integer szorakozohelyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {

        // Itt a HelyFoglalas entitásodat használd!
        List<HelyFoglalas> napiFoglalasok = helyFoglalasRepository.findFoglalasokAdottNapon(szorakozohelyId, datum);
        
        List<String> foglaltPercek = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        for (HelyFoglalas f : napiFoglalasok) {
            LocalDateTime iter = f.getKezdet();
            LocalDateTime vege = f.getVege();
            
            while (iter.isBefore(vege)) {
                foglaltPercek.add(iter.format(formatter));
                iter = iter.plusMinutes(30);
            }
        }
        return ResponseEntity.ok(foglaltPercek);
    }


    @PutMapping("/lemondas/{id}")
    public ResponseEntity<String> lemondHelyFoglalas(@PathVariable Integer id) {
        try {
            // 1. Megkeressük a foglalást
            HelyFoglalas foglalas = helyFoglalasRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foglalás nem található!"));

            // 2. Átállítjuk a státuszt
                foglalas.setAllapot(Allapot.LEMONDVA);           

            // 3. Elmentjük
            helyFoglalasRepository.save(foglalas);

            return ResponseEntity.ok("Sikeres lemondás!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hiba történt a lemondás során.");
        }
    }
}