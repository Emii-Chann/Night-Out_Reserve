package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.services.JatekFoglalasService;

@RestController
@RequestMapping("/api/jatekok")
@CrossOrigin(origins = "*")
public class JatekFoglalasController {

    @Autowired
    private JatekFoglalasService jatekFoglalasService;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody JatekFoglalas ujFoglalas) {
        try{
            jatekFoglalasService.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


        
    @GetMapping("/felhasznalo/{id}")
    public List<JatekFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return jatekFoglalasService.getFelhasznaloFoglalasai(id);
    }


    



}