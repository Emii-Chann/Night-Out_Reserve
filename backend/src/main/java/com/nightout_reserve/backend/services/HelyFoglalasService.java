package com.nightout_reserve.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.exceptions.HelyMarFoglaltException;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.UserRepository;

@Service
public class HelyFoglalasService {

    @Autowired
    private HelyFoglalasRepository repo;
    


    @Autowired
private SzorakozohelyRepository szorakozohelyRepository; // (Vagy ahogy nálad hívják ezt a fájlt)

@Autowired
    private UserRepository userRepository;


    public void deleteById(Integer id) {
    repo.deleteById(id); // A repository beépítve tudja a törlést!
}

public List<HelyFoglalas> getHelyszinFoglalasokByHely(Integer szid) {
        // Itt a findAll() helyett az új szűrős metódust hívjuk:
        List<HelyFoglalas> lista = repo.findBySzorakozohelyId(szid);
        
        for (HelyFoglalas f : lista) {
            // Helyszín nevének kikeresése
            if (f.getSzorakozohelyId() != null) {
                szorakozohelyRepository.findById(f.getSzorakozohelyId())
                    .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev())); 
            }

            // --- ÚJ RÉSZ: Felhasználó nevének kikeresése ---
            if (f.getFelhasznaloId() != null) {
                userRepository.findById(f.getFelhasznaloId())
                    .ifPresent(user -> f.setFelhasznaloNev(user.getUsername())); 
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
           throw new HelyMarFoglaltException("Unfortunately, the venue is already booked at this time!");
        } else {
            return repo.save(ujHelyFoglalas);
        }
    }

}