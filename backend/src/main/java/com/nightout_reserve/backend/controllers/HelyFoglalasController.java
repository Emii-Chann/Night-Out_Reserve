package com.nightout_reserve.backend.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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


    @GetMapping("/foglalt-hely-idopontok") 
    public ResponseEntity<List<String>> getFoglaltHelyIdopontok(
            @RequestParam Integer szorakozohelyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {

        
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
            
            HelyFoglalas foglalas = helyFoglalasRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foglalás nem található!"));

            
                foglalas.setAllapot(Allapot.CANCELLED);           

            
            helyFoglalasRepository.save(foglalas);

            return ResponseEntity.ok("Sikeres lemondás!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hiba történt a lemondás során.");
        }
    }
}