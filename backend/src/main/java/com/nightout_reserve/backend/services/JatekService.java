package com.nightout_reserve.backend.services;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.JatekSzorakozohelyhez;
import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.JatekHelyszinRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;




@Service
public class JatekService {

    @Autowired
    private JatekRepository jatekRepository;

    public void ujJatekMentese(Integer szorakozohelyId, String nev, String leiras) {
        // Létrehozzuk a modellt (használd a saját Jatek osztályodat)
        Jatek ujJatek = new Jatek();
        
        ujJatek.setSzorakozohelyId(szorakozohelyId);
        ujJatek.setNev(nev);
         ujJatek.setLeiras(leiras);

        jatekRepository.save(ujJatek);
    }


@Autowired
    private JatekHelyszinRepository jatekHelyszinRepository; // Ez szünteti meg a hibát a 42. sorban

    public void mentesVagyFrissites(Integer helyId, Integer jatekId, Integer darab, Integer ar, Integer perc) {
    // 1. Megnézzük, van-e már ilyen sor
    Optional<JatekSzorakozohelyhez> letezo = jatekHelyszinRepository.findBySzorakozohelyIdAndJatekId(helyId, jatekId);

    JatekSzorakozohelyhez adat;
    if (letezo.isPresent()) {
        // Ha van, akkor frissítjük a régit
        adat = letezo.get();
    } else {
        // Ha nincs, újat hozunk létre
        adat = new JatekSzorakozohelyhez();
        adat.setSzorakozohelyId(helyId);
        adat.setJatekId(jatekId);
    }

    adat.setDarab(darab);
    adat.setArOra(ar);
    adat.setMinIdotartamPerc(perc);

    jatekHelyszinRepository.save(adat);
}
}
