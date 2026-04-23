package com.nightout_reserve.backend.services;



import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.JatekRepository;

import jakarta.transaction.Transactional;



@Service
public class JatekService {

    @Autowired
    private JatekRepository jatekRepository; 

    public void ujJatekHelyszinhez(Integer helyId, String nev, String leiras, Integer darab, Integer ar) {
        Jatek ujJatek = new Jatek();
        ujJatek.setSzorakozohelyId(helyId);
        ujJatek.setNev(nev);
        ujJatek.setDarab(darab);
        ujJatek.setLeiras(leiras);
        ujJatek.setArOra(ar);
        ujJatek.setMinIdotartamPerc(60); 

        jatekRepository.save(ujJatek); 
    }

    @Transactional
    public Jatek updateJatek(Integer id, String nev, Integer darab, Integer ar) {
        Jatek jatek = jatekRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("A játék nem található!"));

        
        jatek.setNev(nev);
        jatek.setDarab(darab);
        jatek.setArOra(ar);

        return jatekRepository.save(jatek); 
    }
    public Optional<Jatek> findById(Integer id) {
        return jatekRepository.findById(id);
    }
}

