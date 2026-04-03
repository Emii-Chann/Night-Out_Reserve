package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;



@Service
public class JatekFoglalasService {

    @Autowired
    private JatekFoglalasRepository repo;

    public List<JatekFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
        return repo.findByFelhasznaloId(felhasznaloId);
    }

    public ResponseEntity<String> mentes(JatekFoglalas ujFoglalas) {
        int utkozesek = repo.countUtkozesek(
            ujFoglalas.getSzorakozohelyId(), 
            ujFoglalas.getJatekId(), 
            ujFoglalas.getKezdet(), 
            ujFoglalas.getVege()
        );

        if (utkozesek > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Sajnos ez a játék ebben az időpontban már foglalt!");
        }

        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot("FOGLALVA");
        }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres foglalás!");
    }
}