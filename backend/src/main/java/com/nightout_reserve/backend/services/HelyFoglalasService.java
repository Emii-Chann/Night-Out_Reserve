package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;

@Service
public class HelyFoglalasService {

    @Autowired
    private HelyFoglalasRepository repo;

    public List<HelyFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
        return repo.findByFelhasznaloId(felhasznaloId);
    }

    public ResponseEntity<String> mentes(HelyFoglalas ujFoglalas) {
        int utkozesek = repo.countUtkozesek(
            ujFoglalas.getSzorakozohelyId(), 
            ujFoglalas.getKezdet(), 
            ujFoglalas.getVege()
        );

        if (utkozesek > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Sajnos ebben az időpontban a helyszín már foglalt!");
        }

        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot("FOGLALVA");
        }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres helyfoglalás!");
    }
}