package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.TulajBelepes;
import com.nightout_reserve.backend.repositories.TulajBelepesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TulajBelepesServiceImpl implements TulajBelepesService {

    @Autowired
    private TulajBelepesRepository repository;

    @Override
    public TulajBelepes login(String felhasznalonev, String jelszo) {
        // 1. Megkeressük a felhasználót az adatbázisban
        TulajBelepes admin = repository.findByFelhasznalonev(felhasznalonev)
                .orElseThrow(() -> new RuntimeException("Hibás felhasználónév vagy jelszó!")); 
                // Biztonsági okokból sosem mondjuk meg pontosan, melyik volt a rossz!

        // 2. Ellenőrizzük a jelszót (ide jöhet majd a jelszótitkosítás később)
        if (!admin.getJelszo().equals(jelszo)) {
            throw new RuntimeException("Hibás felhasználónév vagy jelszó!");
        }

        // 3. Sikeres belépés: Frissítjük az utolsó belépés idejét
        admin.setUtolsoBelepes(LocalDateTime.now());
        repository.save(admin);

        // 4. Visszaadjuk az admin adatait
        return admin;
    }
}