package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.repositories.AsztalRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/eszkozok")
@CrossOrigin(origins = "*") // Frontend eléréshez
public class EszkozController {

    @Autowired
    private AsztalRepository asztalRepo;

    @Autowired
    private JatekRepository jatekRepo;

    // 1. Összes eszköz lekérése a szórakozóhely ID alapján
    @GetMapping("/{helyszinId}")
    public ResponseEntity<Map<String, Object>> getMindenEszkoz(@PathVariable Integer helyszinId) {
        Map<String, Object> response = new HashMap<>();
        
        // Lekérjük az asztalokat és a játékokat külön
        List<Asztal> asztalok = asztalRepo.findBySzorakozohelyId(helyszinId);
        List<Jatek> jatekok = jatekRepo.findBySzorakozohelyId(helyszinId);
        
        response.put("asztalok", asztalok);
        response.put("jatekok", jatekok);
        
        return ResponseEntity.ok(response);
    }

    // 2. Asztal törlése
    @DeleteMapping("/asztal/{id}")
    public ResponseEntity<?> torolAsztal(@PathVariable Integer id) {
        asztalRepo.deleteById(id);
        return ResponseEntity.ok("Asztal törölve");
    }

    // 3. Játék törlése
    @DeleteMapping("/jatek/{id}")
    public ResponseEntity<?> torolJatek(@PathVariable Integer id) {
        jatekRepo.deleteById(id);
        return ResponseEntity.ok("Játék törölve");
    }

    // 4. Asztal módosítása
    @PutMapping("/asztal/{id}")
    public ResponseEntity<?> modositAsztal(@PathVariable Integer id, @RequestBody Asztal adatok) {
        Asztal asztal = asztalRepo.findById(id).orElseThrow();
        asztal.setAsztalSzam(adatok.getAsztalSzam());
        asztal.setFerohely(adatok.getFerohely());
        // ... egyéb mezők ...
        asztalRepo.save(asztal);
        return ResponseEntity.ok("Asztal frissítve");
    }
}
