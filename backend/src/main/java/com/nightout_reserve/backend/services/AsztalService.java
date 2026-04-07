package com.nightout_reserve.backend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.AsztalRepository;
import com.nightout_reserve.backend.models.Asztal;



@Service
public class AsztalService {

    @Autowired
    private AsztalRepository asztalRepository;

    public void ujAsztalMentese(Integer szorakozohelyId, Integer asztalSzam, Integer ferohely) {
        // Létrehozzuk a modellt (használd a saját Asztal osztályodat)
        Asztal ujAsztal = new Asztal();
        
        ujAsztal.setSzorakozohelyId(szorakozohelyId);
        ujAsztal.setAsztalSzam(asztalSzam);
        ujAsztal.setFerohely(ferohely);

        asztalRepository.save(ujAsztal);
    }
}