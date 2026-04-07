package com.nightout_reserve.backend.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.services.SzorakozohelyService;



@RestController
@RequestMapping("/api/helyszinek")
@CrossOrigin(origins = "*")
public class SzorakozohelyController {

    @Autowired
    private SzorakozohelyRepository repo;

    @GetMapping("/list")
    public List<Szorakozohely> getHelyszinek() {
        // A repository-ban megírt metódust hívjuk meg
        return repo.findByTorolveAtIsNull();
    }

    
 @GetMapping("/{id}/jatekok")  // Tettem egy / jelet a végére is
public List<Map<String, Object>> getJatekokHelyszinen(@PathVariable("id") Integer id) { // Itt explicit megadtam az "id"-t
    return repo.findJatekokByHelyId(id);
}




@Autowired
private SzorakozohelyService szorakozohelyService;

@CrossOrigin(origins = "*") // Tedd ezt az osztály fölé
@PostMapping("/szorakozohelyek/uj")
public ResponseEntity<?> ujSzorakozohelyFelvetel(@RequestBody Map<String, String> body) {
    try {
        String nev = body.get("nev");
        String varos = body.get("varos");
        String cim = body.get("cim");
        String leiras = body.get("leiras");
        String nyitvatartas = body.get("nyitvatartas");
        
        // Számok konvertálása
        Integer asztalokSzama = body.get("asztalok_szama") != null && !body.get("asztalok_szama").isEmpty() 
            ? Integer.parseInt(body.get("asztalok_szama")) : 0;
            
        Integer tulajId = body.get("tulaj_id") != null 
            ? Integer.parseInt(body.get("tulaj_id")) : null;

        if (tulajId == null) {
            return ResponseEntity.badRequest().body("Hiányzó tulajdonos azonosító!");
        }

        // Service hívása
        szorakozohelyService.ujHelyMentes(nev, cim, varos, leiras, nyitvatartas, asztalokSzama, tulajId); 

        return ResponseEntity.ok().body("Sikeres mentés!");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Hiba: " + e.getMessage());
    }
}



}
