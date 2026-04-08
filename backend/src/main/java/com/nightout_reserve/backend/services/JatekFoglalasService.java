package com.nightout_reserve.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.models.AsztalFoglalas;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;



@Service
public class JatekFoglalasService {

    @Autowired
    private JatekFoglalasRepository repo;

    // Ezeket behúzzuk, hogy tudjunk neveket keresni az ID-k alapján
    @Autowired
    private SzorakozohelyRepository szorakozohelyRepo;

    @Autowired
    private JatekRepository jatekRepo;





        public void deleteById(Integer id) {
    repo.deleteById(id); // A repository beépítve tudja a törlést!
}

public List<JatekFoglalas> getJatekFoglalasokByHely(Integer szid) {
    // Itt a findAll() helyett az új szűrős metódust hívjuk:
    List<JatekFoglalas> lista = repo.findBySzorakozohelyId(szid);
    
    for (JatekFoglalas f : lista) {
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepo.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }
    }
    return lista;
}



    public List<JatekFoglalas> getOsszesJatekFoglalas() {
    // 1. Lekérjük az összes játékfoglalást az adatbázisból
    List<JatekFoglalas> lista = repo.findAll();
    
    // 2. Végigmegyünk rajtuk és feltöltjük a szórakozóhely nevét
    for (JatekFoglalas f : lista) {
        // 1. Szórakozóhely nevének lekérése (ezt már megcsináltuk)
        if (f.getSzorakozohelyId() != null) {
            szorakozohelyRepo.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
        }

        // 2. Játék nevének lekérése (EZ HIÁNYZOTT!)
        if (f.getJatekId() != null) {
            jatekRepo.findById(f.getJatekId())
                .ifPresent(jatek -> f.setJatekNev(jatek.getNev())); 
                // Ellenőrizd: a Jatek entitásodban 'nev' vagy 'megnevezes' a mező?
        }
    }
    
    
    return lista;
}

    public void jatekStatuszFrissites(Integer id, String ujStatusz) {
    // 1. Megkeressük a játékfoglalást (feltételezve, hogy a repo a JatekFoglalasRepository)
    JatekFoglalas foglalas = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("A játékfoglalás nem található: " + id));

    // 2. Beállítjuk az új állapotot (Enum használatával)
    try {
        Allapot statuszEnum = Allapot.valueOf(ujStatusz);
        foglalas.setAllapot(statuszEnum);
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Érvénytelen állapot: " + ujStatusz);
    }

    // 3. Mentés
    repo.save(foglalas);
}



    public List<JatekFoglalas> getFelhasznaloFoglalasai(Integer felhasznaloId) {
        List<JatekFoglalas> foglalasok = repo.findByFelhasznaloId(felhasznaloId);

        // EZ A CIKLUS TESZI BELE A NEVEKET!
        for (JatekFoglalas f : foglalasok) {
            szorakozohelyRepo.findById(f.getSzorakozohelyId())
                .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));

            jatekRepo.findById(f.getJatekId())
                .ifPresent(jatek -> f.setJatekNev(jatek.getNev()));
        }

        return foglalasok;
    }

    public ResponseEntity<String> mentes(JatekFoglalas ujFoglalas) {
        int utkozesek = repo.countUtkozesek(
            ujFoglalas.getSzorakozohelyId(), 
            ujFoglalas.getJatekId(), 
            ujFoglalas.getKezdet(), 
            ujFoglalas.getVege()
        );

        if (utkozesek > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Sajnos ez a játék ebben az időpontban már foglalt!");
        }

        if(ujFoglalas.getAllapot() == null) {
            ujFoglalas.setAllapot(Allapot.FUGGO); 
        }
        
        repo.save(ujFoglalas);
        return ResponseEntity.ok("Sikeres foglalás!");
    }
}