package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

import com.nightout_reserve.backend.models.Allapot;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;



@Service
public class JatekFoglalasService {

    @Autowired
    private JatekFoglalasRepository repo;

    // Ezeket behúzzuk, hogy tudjunk neveket keresni az ID-k alapján
    @Autowired
    private SzorakozohelyRepository szorakozohelyRepo;

    @Autowired
    private JatekRepository jatekRepo;

    public List<JatekFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
        List<JatekFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);

        // EZ A CIKLUS TESZI BELE A NEVEKET!
        for (JatekFoglalas f : foglalasok) {
            szorakozohelyRepo.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));

            jatekRepo.findById(f.getJatekId())
                .ifPresent(jatek -> f.setJatekNev(jatek.getNev()));
        }

        return foglalasok;
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
            ujFoglalas.setAllapot(Allapot.FUGGO); 
        }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres foglalás!");
    }
}