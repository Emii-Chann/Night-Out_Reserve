package com.nightout_reserve.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/jatekok")
@CrossOrigin(origins = "http://localhost:3000") // Vagy ahonnan a frontend fut
public class JatekFoglalasController {

    @Autowired
    private JatekFoglalasRepository foglalasRepo;

    @Autowired
private SzorakozohelyRepository repo; // Vagy amilyen nevű Repository-ba írtad a findJatekokByHelyId metódus    t

    @PostMapping("/foglalas")
    public String jatekFoglalasMentes(@RequestBody JatekFoglalas ujFoglalas) {
        // Alapállapot beállítása (ha a frontend nem küldené)
        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot("FÜGGŐ");
        }
        
        foglalasRepo.save(ujFoglalas);
        return "Sikeres mentés!";
    }
  
}