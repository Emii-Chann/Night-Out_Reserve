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
import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.AsztalFoglalasRepository;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.services.AsztalFoglalasService;

@RestController
@RequestMapping("/api/asztalok")
@CrossOrigin(origins = "*")
public class AsztalFoglalasController {

    @Autowired
    private AsztalFoglalasService asztalFoglalasService;

    @Autowired
    private AsztalFoglalasRepository asztalFoglalasRepository;


    
    @Autowired
    private HelyFoglalasRepository helyFoglalasRepository;
    
    @GetMapping("/{helyId}/list")
    public List<Asztal> getAsztalokListaja(@PathVariable Integer helyId) {
        // A Controller csak átpasszolja a kérést a Service-nek!
        return asztalFoglalasService.getAsztalokListaja(helyId);


    }

    @PostMapping("/foglalas")
    public ResponseEntity<String> mentes(@RequestBody AsztalFoglalas ujFoglalas) {
        try{
            asztalFoglalasService.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/felhasznalo/{id}")
    public List<AsztalFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return asztalFoglalasService.getFelhasznaloFoglalasai(id);
    }



    @GetMapping("/foglalt-asztal-idopontok")
public ResponseEntity<List<String>> getFoglaltAsztalIdopontok(
        @RequestParam Integer szorakozohelyId,
        @RequestParam Integer asztalSzam, // Itt az asztal azonosítója
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {

    // 1. Lekérjük a konkrét ASZTAL foglalásait az adott napon
    List<AsztalFoglalas> napiAsztalFoglalasok = asztalFoglalasRepository.findFoglalasokAdottNapon(szorakozohelyId, asztalSzam, datum);
    
    // 2. Lekérjük a TELJES HELYSZÍN foglalásait is ugyanerre a napra
    List<HelyFoglalas> napiHelyFoglalasok = helyFoglalasRepository.findFoglalasokAdottNapon(szorakozohelyId, datum);
    
    List<String> foglaltPercek = new ArrayList<>();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    // Saját asztalfoglalások feldolgozása
    for (AsztalFoglalas f : napiAsztalFoglalasok) {
        hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
    }

    // Helyszín foglalások feldolgozása (ez szürkíti ki az asztalt, ha a hely foglalt!)
    for (HelyFoglalas f : napiHelyFoglalasok) {
        hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
    }
    
    return ResponseEntity.ok(foglaltPercek);
}

// Ne felejtsd el ezt a segédfüggvényt is beletenni a kontrollerbe!
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

    @PutMapping("/lemondas/{id}")
    public ResponseEntity<String> lemondAsztalFoglalas(@PathVariable Integer id) {
        try {
            // 1. Megkeressük a foglalást
            AsztalFoglalas foglalas = asztalFoglalasRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foglalás nem található!"));

            // 2. Átállítjuk a státuszt
                foglalas.setAllapot(Allapot.CANCELLED);           

            // 3. Elmentjük
            asztalFoglalasRepository.save(foglalas);

            return ResponseEntity.ok("Sikeres lemondás!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Hiba történt a lemondás során.");
        }
    }
}

    




