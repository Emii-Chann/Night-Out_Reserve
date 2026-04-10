package com.nightout_reserve.backend.controllers; // Cseréld a te csomagnevedre!

import com.nightout_reserve.backend.models.TulajokAdatai;
import com.nightout_reserve.backend.repositories.TulajokAdataiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tulajdonosok")
@CrossOrigin(origins = "*") // Ha használod a Cors-t
public class TulajokAdataiController {

    @Autowired
    private TulajokAdataiRepository tulajokAdataiRepository;

 @PostMapping("/mentes")
    public ResponseEntity<?> tulajAdatMentes(@RequestBody TulajokAdatai bejovoAdatok) {
        
        // 1. Megnézzük, hogy van-e ID (Tehát frissíteni akarunk-e egy meglévőt)
        if (bejovoAdatok.getId() != null) {
            
            // Kikeressük az adatbázisból a meglévő tulajdonost
            TulajokAdatai letezo = tulajokAdataiRepository.findById(bejovoAdatok.getId()).orElse(null);
            
            if (letezo != null) {
                // 2. CSAK azokat az adatokat írjuk felül, amiket a frontend küldött!
                letezo.setTeljesNev(bejovoAdatok.getTeljesNev());
                letezo.setEmail(bejovoAdatok.getEmail());
                letezo.setTelefon(bejovoAdatok.getTelefon());
                
                // A letezo.getLetrehozvaAt() és letezo.getJelszo() érintetlen marad!
                
                TulajokAdatai frissitett = tulajokAdataiRepository.save(letezo);
                return ResponseEntity.ok(frissitett);
            }
        }
        
        // 3. Ha véletlenül nincs ID (új tulajdonos regisztrál), akkor simán mentjük
        // Ha a DB nem generálja le a dátumot automatikusan, itt manuálisan beállíthatjuk:
        // bejovoAdatok.setLetrehozvaAt(java.time.LocalDateTime.now());
        
        TulajokAdatai uj = tulajokAdataiRepository.save(bejovoAdatok);
        return ResponseEntity.ok(uj);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getTulajdonosAdatok(@PathVariable Integer id) {
        // Megkeressük az adatbázisban a tulajdonost az ID alapján
        TulajokAdatai tulaj = tulajokAdataiRepository.findById(id).orElse(null);
        
        if (tulaj != null) {
            // Ha megtaláltuk, visszaküldjük az adatait (JSON formátumban)
            return ResponseEntity.ok(tulaj);
        } else {
            // Ha még nincs ilyen az adatbázisban (pl. vadonatúj regisztráció)
            return ResponseEntity.notFound().build();
        }
    }
}