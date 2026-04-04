package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

import com.nightout_reserve.backend.models.Allapot;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@Service
public class HelyFoglalasService {

    @Autowired
    private HelyFoglalasRepository repo;


    @Autowired
private SzorakozohelyRepository szorakozohelyRepository; // (Vagy ahogy nálad hívják ezt a fájlt)
    

   public List<HelyFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
    // 1. Lekérjük a nyers foglalásokat
    List<HelyFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);
    
    // 2. Végigmegyünk rajtuk, és kikeresjük hozzájuk a helyszín nevét
    for (HelyFoglalas f : foglalasok) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev())); // Ha nem getNev(), akkor írd át arra, ahogy a Szorakozohely modelben van!
        }
    }
    
    // 3. Visszaadjuk a már kiegészített listát
    return foglalasok;
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
            ujFoglalas.setAllapot(Allapot.FUGGO);     
           }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres helyfoglalás!");
    }
}