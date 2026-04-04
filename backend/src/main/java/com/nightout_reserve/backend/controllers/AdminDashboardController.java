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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.services.AsztalFoglalasService;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@RestController
@RequestMapping("/api/admin/foglalasok")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AsztalFoglalasService asztalService;
    
    // Később ide jöhet a többi service is (játék, helyszín)

    @GetMapping("/asztalok")
    public List<AsztalFoglalas> getAllAsztalFoglalas() {
        return asztalService.getOsszesFoglalas();
    }

    @PutMapping("/asztalok/{id}/allapot")
    public ResponseEntity<?> frissitAllapot(@PathVariable Integer id, @RequestBody Map<String, String> body) {
    try {
        String ujAllapot = body.get("allapot"); // Pl: "JOVAHAGYVA" vagy "LEMONDVA"
        
        // Itt hívd meg a Service-t, ami elvégzi a mentést
        asztalService.statuszFrissites(id, ujAllapot);
        
        return ResponseEntity.ok().body("Állapot sikeresen frissítve!");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Hiba történt!");
    }
}
    
    // Itt lesz majd a végpont az állapot módosításához is (Accept/Reject)
}