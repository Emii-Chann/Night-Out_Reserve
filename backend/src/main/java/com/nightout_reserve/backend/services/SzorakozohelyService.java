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


// ÚJ METÓDUS: A pipa állapotának mentése a leírásba rejtve
    public void frissitBerelhetoseg(Integer id, Boolean statusz) {
        Szorakozohely hely = szorakozohelyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Helyszín nem található"));
            
        String aktualisLeiras = hely.getLeiras() != null ? hely.getLeiras() : "";
        
        if (statusz) {
            // Ha BÉRELHETŐ (pipálva van), kivesszük a rejtett kódot
            aktualisLeiras = aktualisLeiras.replace("[NEM_BERELHETO]", "").trim();
        } else {
            // Ha NEM BÉRELHETŐ (nincs pipálva), betesszük a kódot a szöveg végére
            if (!aktualisLeiras.contains("[NEM_BERELHETO]")) {
                aktualisLeiras += " [NEM_BERELHETO]";
            }
        }
        
        hely.setLeiras(aktualisLeiras);
        szorakozohelyRepository.save(hely);
    }
  
  }