package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.services.AsztalFoglalasService;

@RestController
@RequestMapping("/api/asztalok")
@CrossOrigin(origins = "*")
public class AsztalFoglalasController {

    @Autowired
    private AsztalFoglalasService service;
    
    @GetMapping("/{helyId}/list")
    public List<Asztal> getAsztalokListaja(@PathVariable Integer helyId) {
        // A Controller csak átpasszolja a kérést a Service-nek!
        return service.getAsztalokListaja(helyId); 


    }

    @PostMapping("/foglalas")
    public ResponseEntity<String> mentes(@RequestBody AsztalFoglalas ujFoglalas) {
        return service.mentes(ujFoglalas);
    }

    @GetMapping("/felhasznalo/{id}")
    public List<AsztalFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return service.getFelhasznaloFoglalasai(id);
    }

    


}

