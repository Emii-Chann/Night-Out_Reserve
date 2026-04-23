package com.nightout_reserve.backend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.models.TulajokAdatai;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@Service
public class SzorakozohelyService {

    
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

    
    TulajokAdatai tulaj = new TulajokAdatai();
    tulaj.setId(tulajId); 
    
    
    ujHely.setTulajokAdatai(tulaj);

    
    szorakozohelyRepository.save(ujHely);
}



    public void frissitBerelhetoseg(Integer id, Boolean statusz) {
        Szorakozohely hely = szorakozohelyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Helyszín nem található"));
            
        String aktualisLeiras = hely.getLeiras() != null ? hely.getLeiras() : "";
        
        if (statusz) {
            
            aktualisLeiras = aktualisLeiras.replace("[NEM_BERELHETO]", "").trim();
        } else {
            
            if (!aktualisLeiras.contains("[NEM_BERELHETO]")) {
                aktualisLeiras += " [NEM_BERELHETO]";
            }
        }
        
        hely.setLeiras(aktualisLeiras);
        szorakozohelyRepository.save(hely);
    }
  
  }