package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.models.TulajBelepes;
import com.nightout_reserve.backend.repositories.TulajBelepesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class TulajBelepesServiceImpl implements TulajBelepesService {

    @Autowired
    private TulajBelepesRepository repository;

    // Beimportáljuk a jelszó kódolót
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public TulajBelepes login(String felhasznalonev, String jelszo) {
        // 1. Megkeressük az admint (itt még csak a nevet nézzük)
        TulajBelepes admin = repository.findByFelhasznalonev(felhasznalonev)
                .orElseThrow(() -> new RuntimeException("Hibás felhasználónév vagy jelszó!"));

        // 2. ELLENŐRZÉS BCrypt-tel
        // A passwordEncoder.matches(nyers, kodolt) összeveti a kettőt
        if (!passwordEncoder.matches(jelszo, admin.getJelszo())) {
            throw new RuntimeException("Hibás felhasználónév vagy jelszó!");
        }

        // 3. Sikeres belépés: Frissítjük az utolsó belépés idejét
        admin.setUtolsoBelepes(LocalDateTime.now());
        repository.save(admin);

        System.out.println("---- TESZT: ----");
System.out.println("Bejelentkezett admin: " + admin.getFelhasznalonev());
if (admin.getSzorakozohelyek() != null) {
    System.out.println("Helyek száma: " + admin.getSzorakozohelyek().size());
    for (Szorakozohely sz : admin.getSzorakozohelyek()) {
        System.out.println(" - " + sz.getNev());
    }
} else {
    System.out.println("A lista NULL!");
}
System.out.println("----------------");

return admin;



        
    }



@Override
public void jelszoModositas(Integer id, String regiJelszo, String ujJelszo) {
    // 1. Keressük meg az admint
    TulajBelepes admin = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Admin nem található!"));

    // 2. Ellenőrizzük, hogy a megadott RÉGI jelszó egyezik-e a DB-ben lévővel
    if (!passwordEncoder.matches(regiJelszo, admin.getJelszo())) {
        throw new RuntimeException("A jelenlegi jelszó hibás!");
    }

    // 3. Ha jó, akkor az ÚJ jelszót titkosítjuk és mentjük
    String kodoltUjJelszo = passwordEncoder.encode(ujJelszo);
    admin.setJelszo(kodoltUjJelszo);
    
    repository.save(admin);
}




}