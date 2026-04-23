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

import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.services.AsztalFoglalasService;
import com.nightout_reserve.backend.services.AsztalService;
import com.nightout_reserve.backend.services.HelyFoglalasService;
import com.nightout_reserve.backend.services.JatekFoglalasService;
import com.nightout_reserve.backend.services.JatekService;

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
    else if ("helyszin".equals(tipus)) helyService.helyszinStatuszFrissites(id, ujAllapot); 

    return ResponseEntity.ok().body("Kész!");
}


@DeleteMapping("/torles/{tipus}/{id}")
public ResponseEntity<?> torles(@PathVariable String tipus, @PathVariable Integer id) {
    try {
        switch (tipus.toLowerCase()) {
            case "asztal":
                asztalFoglalasService.deleteById(id); 
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
    try {
        String tipus = body.get("tipus");
        Integer helyId = Integer.parseInt(body.get("szorakozohelyId"));

        if ("asztal".equals(tipus)) {
            asztalService.ujAsztalMentese(
                helyId, 
                Integer.parseInt(body.get("asztalSzam")),
                Integer.parseInt(body.get("ferohely"))
            );
        } else if ("jatek".equals(tipus)) {
            jatkService.ujJatekHelyszinhez( 
                helyId, 
                body.get("jatekNev"), 
                body.get("jatekLeiras"),
                Integer.parseInt(body.get("darab")),
                Integer.parseInt(body.get("ar_ora"))
            );
        }

        return ResponseEntity.ok("Eszköz sikeresen elmentve!");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Hiba történt a mentéskor: " + e.getMessage());
    }
}





}





