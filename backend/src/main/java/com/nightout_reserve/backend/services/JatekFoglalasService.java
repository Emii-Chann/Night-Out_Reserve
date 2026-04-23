package com.nightout_reserve.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.exceptions.JatekMarFoglaltException;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.UserRepository;



@Service
public class JatekFoglalasService {

    @Autowired
    private JatekFoglalasRepository repo;

    // Ezeket behúzzuk, hogy tudjunk neveket keresni az ID-k alapján
    @Autowired
    private SzorakozohelyRepository szorakozohelyRepo;

    @Autowired
    private JatekRepository jatekRepo;

    @Autowired
    private UserRepository userRepository;





        public void deleteById(Integer id) {
    repo.deleteById(id); // A repository beépítve tudja a törlést!
}

public List<JatekFoglalas> getJatekFoglalasokByHely(Integer szid) {
        // Lekérjük a játék foglalásokat
        List<JatekFoglalas> lista = repo.findBySzorakozohelyId(szid);
        
        for (JatekFoglalas f : lista) {
            // Helyszín nevének kikeresése
            if (f.getSzorakozohelyId() != null) {
                szorakozohelyRepo.findById(f.getSzorakozohelyId())
                    .ifPresent(hely -> f.setSzorakozohelyNev(hely.getNev()));
            }

            // Játék nevének kikeresése
            if (f.getJatekId() != null) {
                jatekRepo.findById(f.getJatekId())
                    .ifPresent(jatek -> f.setJatekNev(jatek.getNev()));
            }

            // --- ÚJ RÉSZ: Felhasználó nevének kikeresése ---
            if (f.getFelhasznaloId() != null) {
                userRepository.findById(f.getFelhasznaloId())
                    .ifPresent(user -> f.setFelhasznaloNev(user.getUsername())); 
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

    public JatekFoglalas mentes(JatekFoglalas ujJatekFoglalas) throws JatekMarFoglaltException {
        int utkozesek = repo.countUtkozesek(
            ujJatekFoglalas.getSzorakozohelyId(),
            ujJatekFoglalas.getJatekId(),
            ujJatekFoglalas.getKezdet(),
            ujJatekFoglalas.getVege()
        );
        if(ujJatekFoglalas.getAllapot() == null) {
            ujJatekFoglalas.setAllapot(Allapot.PENDING);
        }
        if (utkozesek > 0) {
            throw new JatekMarFoglaltException("Unfortunately, this game is already booked at this time!");
        } else {
            return repo.save(ujJatekFoglalas);
        }
    }
}