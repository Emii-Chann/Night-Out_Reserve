package com.nightout_reserve.backend.services;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.JatekRepository;



@Service
public class JatekService {

    @Autowired
    private JatekRepository jatekRepository; // A sima Jatek repót használjuk!

    public void ujJatekHelyszinhez(Integer helyId, String nev, String leiras, Integer darab, Integer ar) {
        Jatek ujJatek = new Jatek();
        ujJatek.setSzorakozohelyId(helyId);
        ujJatek.setNev(nev);
        ujJatek.setDarab(darab);
        ujJatek.setLeiras(leiras);
        ujJatek.setArOra(ar);
        ujJatek.setMinIdotartamPerc(60); // Legyen alapból 1 óra

        jatekRepository.save(ujJatek); // Bumm, bent is van a táblában!
    }
}

