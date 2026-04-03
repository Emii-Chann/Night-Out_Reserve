package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.repositories.AsztalFoglalasRepository;
import com.nightout_reserve.backend.repositories.AsztalRepository;


@Service
public class AsztalFoglalasService {

    @Autowired
    private AsztalFoglalasRepository repo;

    @Autowired
    private AsztalRepository asztalRepository;

    public List<AsztalFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
        return repo.findByFelhasznaloId(felhasznaloId);
    }
    public List<Asztal> getAsztalokListaja(Integer helyId) {
        return asztalRepository.findBySzorakozohelyId(helyId);
    }

    public ResponseEntity<String> mentes(AsztalFoglalas ujFoglalas) {
        int utkozesek = repo.countUtkozesek(
            ujFoglalas.getSzorakozohelyId(), 
            ujFoglalas.getAsztalSzam(), 
            ujFoglalas.getKezdet(), 
            ujFoglalas.getVege()
        );

        if (utkozesek > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Sajnos ez az asztal ebben az időpontban már foglalt!");
        }

        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot("FOGLALVA");
        }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres asztalfoglalás!");
    }
}