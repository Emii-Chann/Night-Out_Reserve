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
    repo.deleteById(id); // A repository beépítve tudja a törlést!
}





public List<AsztalFoglalas> getFoglalasokByHely(Integer szid) {
    // 1. Lekérjük az adott helyszínhez tartozó összes asztalfoglalást
    List<AsztalFoglalas> lista = repo.findBySzorakozohelyId(szid);
    
    // 2. Végigmegyünk a listán, és „felöltöztetjük” adatokkal
    for (AsztalFoglalas f : lista) {
        // Helyszín nevének kikeresése (ez már megvolt)
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }

        // --- ÚJ RÉSZ: Felhasználó nevének kikeresése ---
        if (f.getFelhasznaloId() != null) {
            userRepository.findById(f.getFelhasznaloId())
                .ifPresent(user -> f.setFelhasznaloNev(user.getUsername())); 
                // Megjegyzés: Ha a Felhasznalo osztályodban nem 'nev', 
                // hanem pl. 'teljesNev' a mező, akkor user.getTeljesNev()-et írj!
        }
    }
    return lista;
}

    public List<AsztalFoglalas> getOsszesFoglalas() {
    List<AsztalFoglalas> lista = repo.findAll(); // Az összeset lekérjük
    
    // Itt is töltsük fel a neveket, hogy a dashboardon látszódjon
    for (AsztalFoglalas f : lista) {
        szorakozohelyRepository.findById(f.getSzorakozohelyId())
            .ifPresent(sz -> f.setSzorakozohelyNev(sz.getNev()));
    }
    return lista;
}

public void statuszFrissites(Integer id, String ujStatusz) {
    // 1. Megkeressük a foglalást az ID alapján
    AsztalFoglalas foglalas = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("A foglalás nem található ezzel az ID-val: " + id));

    // 2. Szövegből visszaalakítjuk Enum típusra (pl. "JOVAHAGYVA" -> Allapot.JOVAHAGYVA)
    try {
        Allapot statuszEnum = Allapot.valueOf(ujStatusz);
        foglalas.setAllapot(statuszEnum);
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Érvénytelen állapot típus: " + ujStatusz);
    }

    // 3. Mentés az adatbázisba
    repo.save(foglalas);
}
    

    public List<AsztalFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
    // 1. Lekérjük a nyers foglalásokat
    List<AsztalFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);
    
    // 2. Végigmegyünk rajtuk, és kikeresjük hozzájuk a helyszín nevét
    for (AsztalFoglalas f : foglalasok) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepository.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev())); // Ha nem getNev(), akkor írd át arra, ahogy a Szorakozohely modelben van!
        }
    }
    
    // 3. Visszaadjuk a már kiegészített listát
    return foglalasok;
}
    public List<Asztal> getAsztalokListaja(Integer helyId) {
        return asztalRepository.findBySzorakozohelyId(helyId);
    }






    public AsztalFoglalas mentes(AsztalFoglalas ujFoglalas) throws AsztalMarFoglaltException{
        int utkozesek = repo.countUtkozesek( //Tesztelted ezt? Biztos működik?
                ujFoglalas.getSzorakozohelyId(),
                ujFoglalas.getAsztalSzam(),
                ujFoglalas.getKezdet(),
                ujFoglalas.getVege()
        );
        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot(Allapot.PENDING);
        }

        if (utkozesek > 0) {
            throw new AsztalMarFoglaltException("Sajnos ez az asztal ebben az időpontban már foglalt!");
        } else {
            return repo.save(ujFoglalas);
        }



    }




}