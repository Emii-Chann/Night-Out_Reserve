package com.nightout_reserve.backend.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.enums.Allapot;
import com.nightout_reserve.backend.models.HelyFoglalas;
import com.nightout_reserve.backend.models.JatekFoglalas;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;
import com.nightout_reserve.backend.services.JatekFoglalasService;

@RestController
@RequestMapping("/api/jatekok")
@CrossOrigin(origins = "*")
public class JatekFoglalasController {

    @Autowired
    private JatekFoglalasService jatekFoglalasService;


    @Autowired
    private JatekFoglalasRepository jatekFoglalasRepository;



    @Autowired
    private HelyFoglalasRepository helyFoglalasRepository;

    @PostMapping("/mentes")
    public ResponseEntity<String> mentes(@RequestBody JatekFoglalas ujFoglalas) {
        try{
            jatekFoglalasService.mentes(ujFoglalas);
            return new ResponseEntity<>("Sikeres foglalás!", HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


        
    @GetMapping("/felhasznalo/{id}")
    public List<JatekFoglalas> getFelhasznaloFoglalasai(@PathVariable Integer id) {
        return jatekFoglalasService.getFelhasznaloFoglalasai(id);
    }






   @GetMapping("/foglalt-idopontok")
    public ResponseEntity<List<String>> getFoglaltIdopontok(
            @RequestParam Integer helyId,
            @RequestParam Integer jatekId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {

        
        List<JatekFoglalas> napiJatekFoglalasok = jatekFoglalasRepository.findFoglalasokAdottNapon(helyId, jatekId, datum);
        
        
        List<HelyFoglalas> napiHelyFoglalasok = helyFoglalasRepository.findFoglalasokAdottNapon(helyId, datum);
        
        List<String> foglaltPercek = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        
        for (JatekFoglalas f : napiJatekFoglalasok) {
            hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
        }

        
        for (HelyFoglalas f : napiHelyFoglalasok) {
            hozzaadIdoszeleteket(foglaltPercek, f.getKezdet(), f.getVege(), formatter);
        }
        
        return ResponseEntity.ok(foglaltPercek);
    }

    
    private void hozzaadIdoszeleteket(List<String> lista, LocalDateTime start, LocalDateTime end, DateTimeFormatter fmt) {
        LocalDateTime iter = start;
        while (iter.isBefore(end)) {
            String ido = iter.format(fmt);
            if (!lista.contains(ido)) {
                lista.add(ido);
            }
            iter = iter.plusMinutes(30);
        }
    }


    
        @PutMapping("/lemondas/{id}")
        public ResponseEntity<String> lemondHelyFoglalas(@PathVariable Integer id) {
            try {
                
                JatekFoglalas foglalas = jatekFoglalasRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Foglalás nem található!"));
    
                
                
                foglalas.setAllapot(Allapot.CANCELLED); 
    
                
                jatekFoglalasRepository.save(foglalas);
    
                return ResponseEntity.ok("Sikeres lemondás!");
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Hiba történt a lemondás során.");
            }
    



}
}