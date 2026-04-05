package com.nightout_reserve.backend.controllers;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.services.AsztalFoglalasService;
import com.nightout_reserve.backend.services.HelyFoglalasService;
import com.nightout_reserve.backend.services.JatekFoglalasService;


import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@RestController
@RequestMapping("/api/admin/foglalasok")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AsztalFoglalasService asztalService;

    @Autowired
    private JatekFoglalasService jatekService;
    @Autowired
    private HelyFoglalasService helyService;
    


@GetMapping("/osszes")
public List<Object> getAllFoglalasok(@RequestParam Integer szid) {
    List<Object> minden = new ArrayList<>();
    
    // Most már szűrve kérjük le az adatokat!
    minden.addAll(asztalService.getFoglalasokByHely(szid));
    minden.addAll(jatekService.getJatekFoglalasokByHely(szid));
    minden.addAll(helyService.getHelyszinFoglalasokByHely(szid));
    
    return minden;
}

@PutMapping("/frissit-allapot")
public ResponseEntity<?> frissitAllapot(@RequestBody Map<String, String> body) {
    Integer id = Integer.parseInt(body.get("id"));
    String ujAllapot = body.get("allapot");
    String tipus = body.get("tipus");

    if ("asztal".equals(tipus)) asztalService.statuszFrissites(id, ujAllapot);
    else if ("jatek".equals(tipus)) jatekService.jatekStatuszFrissites(id, ujAllapot);
    else if ("helyszin".equals(tipus)) helyService.helyszinStatuszFrissites(id, ujAllapot); // EZ AZ ÚJ

    return ResponseEntity.ok().body("Kész!");
}
    
}