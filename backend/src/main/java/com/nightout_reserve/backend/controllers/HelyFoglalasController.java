package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.services.HelyFoglalasService;

@RestController
@RequestMapping("/api/helyfoglalas")
@CrossOrigin(origins = "*")
public class HelyFoglalasController {

    @Autowired
    private HelyFoglalasService service;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody HelyFoglalas ujFoglalas) {
        try{
            service.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }
    

    @GetMapping("/felhasznalo/{id}")
    public List<HelyFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return service.getFelhasznaloFoglalasai(id);
    }
}