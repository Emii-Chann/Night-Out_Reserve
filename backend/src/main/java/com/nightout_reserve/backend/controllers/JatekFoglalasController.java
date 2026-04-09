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

import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.services.HelyFoglalasService;
import com.nightout_reserve.backend.services.JatekFoglalasService;

@RestController
@RequestMapping("/api/jatekok")
@CrossOrigin(origins = "*")
public class JatekFoglalasController {

    @Autowired
    private JatekFoglalasService jatekFoglalasService;


    @Autowired
    private JatekFoglalasRepository jatekFoglalasRepository;



    @Autowired
    private HelyFoglalasRepository helyFoglalasRepository;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody JatekFoglalas ujFoglalas) {
        try{
            jatekFoglalasService.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


        
    @GetMapping("/felhasznalo/{id}")
    public List<JatekFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return jatekFoglalasService.getFelhasznaloFoglalasai(id);
    }






   @GetMapping("/foglalt-idopontok")
    public ResponseEntity<List<String>> getFoglaltIdopontok(
            @RequestParam Integer helyId,
            @RequestParam Integer jatekId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {

        // 1. Játék foglalások lekérése
        List<JatekFoglalas> napiJatekFoglalasok = jatekFoglalasRepository.findFoglalasokAdottNapon(helyId, jatekId, datum);
        
        // 2. Teljes helyszín foglalások lekérése
        List<HelyFoglalas> napiHelyFoglalasok = helyFoglalasRepository.findFoglalasokAdottNapon(helyId, datum);
        
        List<String> foglaltPercek = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // Játék foglalások feldolgozása
        for (JatekFoglalas f : napiJatekFoglalasok) {
            hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
        }

        // Helyszín foglalások feldolgozása (ez szürkíti ki a játékot is!)
        for (HelyFoglalas f : napiHelyFoglalasok) {
            hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
        }
        
        return ResponseEntity.ok(foglaltPercek);
    }

    // Ezt a metódust is másold be a Controllerbe, ez végzi a piszkos munkát
    private void hozzaadIdoszeleteket(List<String> lista, LocalDateTime start, LocalDateTime end, DateTimeFormatter fmt) {
        LocalDateTime iter = start;
        while (iter.isBefore(end)) {
            String ido = iter.format(fmt);
            if (!lista.contains(ido)) {
                lista.add(ido);
            }
            iter = iter.plusMinutes(30);
        }
    }



}