package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.repositories.AsztalRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.services.AsztalService;
import com.nightout_reserve.backend.services.JatekService;

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

    @RestController
@RequestMapping("/api/admin/eszkoz")
@CrossOrigin(origins = "*") // Fejlesztés alatt engedélyezzük a frontendet
public class AdminEszkozController {

    @Autowired
    private AsztalService asztalService;

    @Autowired
    private JatekService jatekService;

    // 1. ADATOK LEKÉRÉSE SZERKESZTÉSHEZ (GET)
    @GetMapping("/{tipus}/{id}")
    public ResponseEntity<?> getEszkozForEdit(@PathVariable String tipus, @PathVariable Integer id) {
        if ("asztal".equalsIgnoreCase(tipus)) {
            return asztalService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } else if ("jatek".equalsIgnoreCase(tipus)) {
            return jatekService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.badRequest().body("Ismeretlen eszköztípus!");
    }

    // 2. MÓDOSÍTÁS MENTÉSE (PUT)
    @PutMapping("/modosit/{tipus}/{id}")
    public ResponseEntity<?> updateEszkoz(
            @PathVariable String tipus,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> adatok) {

        try {
            if ("asztal".equalsIgnoreCase(tipus)) {
                // Adatok kinyerése a JSON-ből
                Integer ujFerohely = Integer.parseInt(adatok.get("ferohely").toString());
                // Az asztalnál az ID maga az asztalSzam a te rendszeredben
                Asztal frissitett = asztalService.updateAsztal(id, ujFerohely);
                return ResponseEntity.ok(frissitett);

            } else if ("jatek".equalsIgnoreCase(tipus)) {
                String nev = (String) adatok.get("jatekNev");
                Integer darab = Integer.parseInt(adatok.get("darab").toString());
                Integer ar = Integer.parseInt(adatok.get("ar_ora").toString());

                Jatek frissitett = jatekService.updateJatek(id, nev, darab, ar);
                return ResponseEntity.ok(frissitett);
            }
            
            return ResponseEntity.badRequest().body("Hiba: Ismeretlen típus!");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hiba a mentés során: " + e.getMessage());
        }
    }
}
}
