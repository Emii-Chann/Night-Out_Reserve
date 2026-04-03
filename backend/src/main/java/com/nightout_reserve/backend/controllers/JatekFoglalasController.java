package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.services.JatekFoglalasService;

@RestController
@RequestMapping("/api/jatekok")
@CrossOrigin(origins = "*")
public class JatekFoglalasController {

    @Autowired
    private JatekFoglalasService service;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody JatekFoglalas ujFoglalas) {
        return service.mentes(ujFoglalas);
    }

    @GetMapping("/felhasznalo/{id}")
    public List<JatekFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return service.getFelhasznaloFoglalasai(id);
    }
}