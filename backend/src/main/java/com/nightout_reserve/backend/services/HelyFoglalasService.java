package com.nightout_reserve.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.exceptions.HelyMarFoglaltException;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;

@Service
public class HelyFoglalasService {

    @Autowired
    private HelyFoglalasRepository repo;
    


    @Autowired
private SzorakozohelyRepository szorakozohelyRepository; // (Vagy ahogy nálad hívják ezt a fájlt)


    public void deleteById(Integer id) {
    repo.deleteById(id); // A repository beépítve tudja a törlést!
}


public List<HelyFoglalas> getHelyszinFoglalasokByHely(Integer szid) {
    // Itt a findAll() helyett az új szűrős metódust hívjuk:
    List<HelyFoglalas> lista = repo.findBySzorakozohelyId(szid);
    
    // A név kikereső rész marad a régi
    for (HelyFoglalas f : lista) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }
    }
    return lista;
}


public List<HelyFoglalas> getOsszesHelyszinFoglalas() {
    List<HelyFoglalas> lista = repo.findAll();
    
    for (HelyFoglalas f : lista) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }
    }
    return lista;
}

// Ne felejtsd el az állapotfrissítőt sem ide!
public void helyszinStatuszFrissites(Integer id, String ujStatusz) {
    HelyFoglalas f = repo.findById(id).orElseThrow();
    f.setAllapot(Allapot.valueOf(ujStatusz));
    repo.save(f);
}
    

   public List<HelyFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
    // 1. Lekérjük a nyers foglalásokat
    List<HelyFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);
    
    // 2. Végigmegyünk rajtuk, és kikeresjük hozzájuk a helyszín nevét
    for (HelyFoglalas f : foglalasok) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev())); // Ha nem getNev(), akkor írd át arra, ahogy a Szorakozohely modelben van!
        }
    }
    
    // 3. Visszaadjuk a már kiegészített listát
    return foglalasok;
}


    public HelyFoglalas mentes(HelyFoglalas ujHelyFoglalas) throws HelyMarFoglaltException{
        int utkozesek = repo.countUtkozesek(
            ujHelyFoglalas.getSzorakozohelyId(),
            ujHelyFoglalas.getKezdet(),
            ujHelyFoglalas.getVege()
        );
        if(ujHelyFoglalas.getAllapot() == null) {
            ujHelyFoglalas.setAllapot(Allapot.PENDING);
        }
        if (utkozesek > 0) {
           throw new HelyMarFoglaltException("Sajnos ebben az időpontban a helyszín már foglalt!");
        } else {
            return repo.save(ujHelyFoglalas);
        }
    }

}