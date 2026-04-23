package com.nightout_reserve.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.exceptions.AsztalMarFoglaltException;
import com.nightout_reserve.backend.models.Asztal;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.repositories.AsztalFoglalasRepository;
import com.nightout_reserve.backend.repositories.AsztalRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.UserRepository;


@Service
public class AsztalFoglalasService {

    @Autowired
    private AsztalFoglalasRepository repo;

    @Autowired
    private AsztalRepository asztalRepository;

    @Autowired
    private SzorakozohelyRepository szorakozohelyRepository;

    @Autowired
    private UserRepository userRepository;
    



    public void deleteById(Integer id) {
    repo.deleteById(id); 
}





public List<AsztalFoglalas> getFoglalasokByHely(Integer szid) {
    
    List<AsztalFoglalas> lista = repo.findBySzorakozohelyId(szid);
    
    
    for (AsztalFoglalas f : lista) {
        
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }

        
        if (f.getFelhasznaloId() != null) {
            userRepository.findById(f.getFelhasznaloId())
                .ifPresent(user -> f.setFelhasznaloNev(user.getUsername())); 
                
                
        }
    }
    return lista;
}

    public List<AsztalFoglalas> getOsszesFoglalas() {
    List<AsztalFoglalas> lista = repo.findAll(); 
    
    
    for (AsztalFoglalas f : lista) {
        szorakozohelyRepository.findById(f.getSzorakozohelyId())
            .ifPresent(sz -> f.setSzorakozohelyNev(sz.getNev()));
    }
    return lista;
}

public void statuszFrissites(Integer id, String ujStatusz) {
    
    AsztalFoglalas foglalas = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("A foglalás nem található ezzel az ID-val: " + id));

    
    try {
        Allapot statuszEnum = Allapot.valueOf(ujStatusz);
        foglalas.setAllapot(statuszEnum);
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Érvénytelen állapot típus: " + ujStatusz);
    }

    
    repo.save(foglalas);
}
    

    public List<AsztalFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
    
    List<AsztalFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);
    
    
    for (AsztalFoglalas f : foglalasok) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev())); 
        }
    }
    
    
    return foglalasok;
}
    public List<Asztal> getAsztalokListaja(Integer helyId) {
        return asztalRepository.findBySzorakozohelyId(helyId);
    }






    public AsztalFoglalas mentes(AsztalFoglalas ujFoglalas) throws AsztalMarFoglaltException{
        int utkozesek = repo.countUtkozesek( 
                ujFoglalas.getSzorakozohelyId(),
                ujFoglalas.getAsztalSzam(),
                ujFoglalas.getKezdet(),
                ujFoglalas.getVege()
        );
        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot(Allapot.PENDING);
        }

        if (utkozesek > 0) {
            throw new AsztalMarFoglaltException("Unfortunately, this table is already occupied at this time!");
        } else {
            return repo.save(ujFoglalas);
        }



    }




}