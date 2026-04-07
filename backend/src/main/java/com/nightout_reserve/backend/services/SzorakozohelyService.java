package com.nightout_reserve.backend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@Service
public class SzorakozohelyService {

    // Itt hívjuk be a Repository-t (írd át a pontos nevére, ha nálad máshogy hívják!)
    @Autowired
    private SzorakozohelyRepository szorakozohelyRepository;

  public void ujHelyMentes(String nev, String cim, String varos, String leiras, String nyitvatartas, Integer asztalokSzama, Integer tulajId) {
    Szorakozohely ujHely = new Szorakozohely();
    ujHely.setNev(nev);
    ujHely.setCim(cim);
    ujHely.setVaros(varos);
    ujHely.setLeiras(leiras);
    ujHely.setNyitvatartas(nyitvatartas);
    ujHely.setAsztalokSzama(asztalokSzama);
    ujHely.setTulajId(tulajId);
    
    // A letrehozva_at részt a Java/DB automatikusan kezeli, ha be van állítva, 
    // de ha kézzel kell, akkor: ujHely.setLetrehozvaAt(LocalDateTime.now());
    
    szorakozohelyRepository.save(ujHely);
}
}