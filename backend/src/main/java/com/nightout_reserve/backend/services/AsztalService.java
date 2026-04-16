package com.nightout_reserve.backend.services;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

import jakarta.transaction.Transactional;

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

    public Optional<Asztal> findById(Integer id) {
        return asztalRepository.findById(id);
    }

    @Transactional
    public Asztal updateAsztal(Integer id, Integer ujFerohely) {
        // Megkeressük az asztalt, ha nincs meg, hibát dobunk
        Asztal asztal = asztalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asztal nem található ezzel az azonosítóval: " + id));

        // Módosítjuk a férőhelyet
        asztal.setFerohely(ujFerohely);

        // Itt opcionálisan módosíthatod az asztalszámot is, ha szükséges:
        // asztal.setAsztalSzam(ujAsztalSzam);

        // Elmentjük a módosításokat
        return asztalRepository.save(asztal);
    }

    /**
     * Lekéri az összes asztalt egy adott szórakozóhelyhez.
     */
    public List<Asztal> findBySzorakozohelyId(Integer szid) {
        return asztalRepository.findBySzorakozohelyId(szid);
    }
}