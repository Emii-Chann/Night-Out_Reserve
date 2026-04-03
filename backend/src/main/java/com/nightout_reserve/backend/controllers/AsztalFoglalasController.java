package com.nightout_reserve.backend.controllers;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.repositories.AsztalFoglalasRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@RestController
@RequestMapping("/api/asztalok")
@CrossOrigin(origins = "*")
public class AsztalFoglalasController {

    @Autowired
    private AsztalFoglalasRepository asztalRepo;

    @Autowired
    private SzorakozohelyRepository szorakozoRepo;

    @GetMapping("/{id}/list")
    public List<Map<String, Object>> getAsztalok(@PathVariable Integer id) {
        return szorakozoRepo.findAsztalokByHelyId(id);
    }

    @PostMapping("/foglalas")
    public String asztalFoglalasMentes(@RequestBody AsztalFoglalas ujFoglalas) {
        ujFoglalas.setAllapot("FOGLALVA");
        asztalRepo.save(ujFoglalas);
        return "Sikeres asztalfoglalás!";
    }
}