package com.nightout_reserve.backend.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.services.AsztalFoglalasService;
import com.nightout_reserve.backend.services.HelyFoglalasService;
import com.nightout_reserve.backend.services.JatekFoglalasService;
import com.nightout_reserve.backend.services.AsztalService;
import com.nightout_reserve.backend.services.JatekService;


import com.nightout_reserve.backend.repositories.JatekRepository;

@RestController
@RequestMapping("/api/admin/foglalasok")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AsztalFoglalasService asztalFoglalasService;

     @Autowired
    private AsztalService asztalService;

     @Autowired
    private JatekService jatkService;

    @Autowired
    private JatekRepository jatekRepo;

    @Autowired
    private JatekFoglalasService jatekService;
    @Autowired
    private HelyFoglalasService helyService;
    


@GetMapping("/osszes")
public List<Object> getAllFoglalasok(@RequestParam Integer szid) {
    List<Object> minden = new ArrayList<>();
    
    // Most már szűrve kérjük le az adatokat!
    minden.addAll(asztalFoglalasService.getFoglalasokByHely(szid));
    minden.addAll(jatekService.getJatekFoglalasokByHely(szid));
    minden.addAll(helyService.getHelyszinFoglalasokByHely(szid));
    
    return minden;
}

@PutMapping("/frissit-allapot")
public ResponseEntity<?> frissitAllapot(@RequestBody Map<String, String> body) {
    Integer id = Integer.parseInt(body.get("id"));
    String ujAllapot = body.get("allapot");
    String tipus = body.get("tipus");

    if ("asztal".equals(tipus)) asztalFoglalasService.statuszFrissites(id, ujAllapot);
    else if ("jatek".equals(tipus)) jatekService.jatekStatuszFrissites(id, ujAllapot);
    else if ("helyszin".equals(tipus)) helyService.helyszinStatuszFrissites(id, ujAllapot); // EZ AZ ÚJ

    return ResponseEntity.ok().body("Kész!");
}


@DeleteMapping("/torles/{tipus}/{id}")
public ResponseEntity<?> torles(@PathVariable String tipus, @PathVariable Integer id) {
    try {
        switch (tipus.toLowerCase()) {
            case "asztal":
                asztalFoglalasService.deleteById(id); // Vagy ha a repót hívod közvetlenül: asztalRepo.deleteById(id);
                break;
            case "jatek":
                jatekService.deleteById(id);
                break;
            case "helyszin":
                helyService.deleteById(id);
                break;
            default:
                return ResponseEntity.badRequest().body("Ismeretlen foglalástípus!");
        }
        return ResponseEntity.ok().body("Sikeres törlés!");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Hiba a törléskor: " + e.getMessage());
    }
}


@PostMapping("/eszkoz/uj")
public ResponseEntity<?> ujEszkoz(@RequestBody Map<String, String> body) {
    String tipus = body.get("tipus");
    Integer helyId = Integer.parseInt(body.get("szorakozohelyId"));

    if ("asztal".equals(tipus)) {
        // Feltételezve, hogy van AsztalService-ed
        asztalService.ujAsztalMentese(
            helyId, 
            Integer.parseInt(body.get("asztalSzam")), 
            Integer.parseInt(body.get("ferohely"))
        );
    } else if ("jatek".equals(tipus)) {
        // Feltételezve, hogy van JatekService-ed
            jatkService.ujJatekMentese(
            helyId, 
            body.get("jatekNev"), 
            body.get("jatekTipus")
        );
    }

    return ResponseEntity.ok("Eszköz elmentve!");
}

@PostMapping("/eszkoz/uj-jatek")
public ResponseEntity<?> ujJatekHelyszinre(@RequestBody Map<String, String> body) {
    try {
        Integer helyId = Integer.parseInt(body.get("szorakozohelyId"));
        Integer jatekId = Integer.parseInt(body.get("jatekId"));
        Integer darab = Integer.parseInt(body.get("darab"));
        Integer ar = Integer.parseInt(body.get("ar_ora"));
        Integer perc = Integer.parseInt(body.get("min_perc"));

        // EZT CSERÉLD LE AZ ÚJ METÓDUSRA:
        jatkService.mentesVagyFrissites(helyId, jatekId, darab, ar, perc);

        return ResponseEntity.ok("Játék sikeresen mentve/frissítve!");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Hiba történt: " + e.getMessage());
    }
}



// 1. Csak a játék mentése a globális táblába
@PostMapping("/jatek/uj-global")
public ResponseEntity<?> ujGlobalJatek(@RequestBody Jatek jatek) {
    jatekRepo.save(jatek);
    return ResponseEntity.ok("Kész");
}

// 2. Az összes játék lekérése a legördülő menühöz
@GetMapping("/jatek/osszes")
public List<Jatek> getOsszesJatek() {
    return jatekRepo.findAll();
}

}

