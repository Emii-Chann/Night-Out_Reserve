package com.nightout_reserve.backend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.models.TulajokAdatai;
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

    // 1. Létrehozunk egy hivatkozást a tulajdonosra az ID alapján
    TulajokAdatai tulaj = new TulajokAdatai();
    tulaj.setId(tulajId); 
    
    // 2. Ezt az objektumot adjuk át! (Figyelj a nagy 'T' betűre a setTulajokAdatai-ban)
    ujHely.setTulajokAdatai(tulaj);

    // A letrehozva_at részt a Java/DB automatikusan kezeli...
    szorakozohelyRepository.save(ujHely);
}
}