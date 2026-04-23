package com.nightout_reserve.backend.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nightout_reserve.backend.models.Jatek;
import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.models.TulajokAdatai;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekRepository;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;
import com.nightout_reserve.backend.repositories.TulajokAdataiRepository;
import com.nightout_reserve.backend.services.SzorakozohelyService;



@RestController
@RequestMapping("/api/helyszinek")
@CrossOrigin(origins = "*")
public class SzorakozohelyController {

    @Autowired
    private SzorakozohelyRepository repo;
       


    @GetMapping("/list")
    public List<Szorakozohely> getHelyszinek() {
        
        return repo.findByTorolveAtIsNull();
    }

     @Autowired
    private JatekFoglalasRepository jatekrepo;
    @Autowired
    private TulajokAdataiRepository tulajokAdataiRepository;




@Autowired
private SzorakozohelyService szorakozohelyService;

@CrossOrigin(origins = "*") 




@PostMapping("/uj-hely-form-data")
public ResponseEntity<?> ujHelyFormData(
        @RequestParam("nev") String nev,
        @RequestParam("varos") String varos,
        @RequestParam("cim") String cim,
        @RequestParam("leiras") String leiras,
        @RequestParam("nyitvatartas") String nyitvatartas,
        @RequestParam("asztalokSzama") Integer asztalokSzama,
        @RequestParam("tulajId") Integer tulajId, 
        @RequestParam(value = "kep", required = false) MultipartFile kep) throws IOException {

    Szorakozohely ujHely = new Szorakozohely();
    ujHely.setNev(nev);
    ujHely.setVaros(varos);
    ujHely.setCim(cim);
    ujHely.setLeiras(leiras);
    ujHely.setNyitvatartas(nyitvatartas);
    ujHely.setAsztalokSzama(asztalokSzama);
    
    TulajokAdatai tulaj = tulajokAdataiRepository.findById(tulajId)
            .orElseThrow(() -> new RuntimeException("Tulajdonos nem található!"));
    
    
    ujHely.setTulajokAdatai(tulaj);

    if (kep != null && !kep.isEmpty()) {
        String fajlNev = System.currentTimeMillis() + "_" + kep.getOriginalFilename();
        Path utvonal = Paths.get("uploads/" + fajlNev);
        Files.write(utvonal, kep.getBytes());
        ujHely.setKeputvonal("/uploads/" + fajlNev);
    }

    repo.save(ujHely);
    return ResponseEntity.ok("Sikeres mentés!");
}





    @Autowired
    private JatekRepository jatkrepo;
    
    @GetMapping("/jatekok/{helyId}")
    public ResponseEntity<List<Jatek>> getJatekokHelyszinhez(@PathVariable Integer helyId) {
    try {
        List<Jatek> jatekok = jatkrepo.findBySzorakozohelyId(helyId);
        return ResponseEntity.ok(jatekok);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(null);
    }
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteHelyszin(@PathVariable Integer id) {
    repo.deleteById(id);
    return ResponseEntity.ok().build();
}

@PutMapping("/{id}")
public ResponseEntity<Szorakozohely> updateHelyszin(
        @PathVariable Integer id,
        @RequestParam("nev") String nev,
        @RequestParam("varos") String varos,
        @RequestParam("cim") String cim,
        @RequestParam("leiras") String leiras,
        @RequestParam("nyitvatartas") String nyitvatartas,
        @RequestParam(value = "kep", required = false) MultipartFile kep) throws IOException {

    Szorakozohely regi = repo.findById(id).orElseThrow();
    
    
    regi.setNev(nev);
    regi.setVaros(varos);
    regi.setCim(cim);
    regi.setLeiras(leiras);
    regi.setNyitvatartas(nyitvatartas);

    
    if (kep != null && !kep.isEmpty()) {
        
        String fajlNev = id + "_" + System.currentTimeMillis() + "_" + kep.getOriginalFilename();
        
        
        
        Path utvonal = Paths.get("uploads/" + fajlNev);
        Files.write(utvonal, kep.getBytes());
        
        
        regi.setKeputvonal("/uploads/" + fajlNev);
    }

    return ResponseEntity.ok(repo.save(regi));
}


@GetMapping("/{id}")
public ResponseEntity<Szorakozohely> getHelyszinById(@PathVariable Integer id) {
    return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping("/list/{tulajId}")
public List<Szorakozohely> getHelyszinek(@PathVariable Integer tulajId) {
    
return repo.findByTulajokAdataiIdAndTorolveAtIsNull(tulajId);}

@PostMapping("/{id}/kep-feltoltes")
public ResponseEntity<?> kepFeltoltes(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
    try {
        
        String fileName = id + "_" + file.getOriginalFilename();
        Path path = Paths.get("uploads/" + fileName);
        Files.write(path, file.getBytes());

        
        Szorakozohely hely = repo.findById(id).get();
        hely.setKeputvonal("/uploads/" + fileName);
        repo.save(hely);

        return ResponseEntity.ok("Kép sikeresen feltöltve!");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Hiba a feltöltés során.");
    }
}


    @PutMapping("/{id}/berelheto")
    public ResponseEntity<?> frissitBerelhetoseg(@PathVariable Integer id, @RequestParam Boolean statusz) {
        try {
            szorakozohelyService.frissitBerelhetoseg(id, statusz);
            return ResponseEntity.ok().body("{\"message\": \"Sikeres mentés\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Hiba történt a mentés során.");
        }
    }


}
