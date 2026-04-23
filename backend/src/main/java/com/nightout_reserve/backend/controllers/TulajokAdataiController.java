package com.nightout_reserve.backend.controllers; 

import com.nightout_reserve.backend.models.TulajokAdatai;
import com.nightout_reserve.backend.repositories.TulajokAdataiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tulajdonosok")
@CrossOrigin(origins = "*") 
public class TulajokAdataiController {

    @Autowired
    private TulajokAdataiRepository tulajokAdataiRepository;

 @PostMapping("/mentes")
    public ResponseEntity<?> tulajAdatMentes(@RequestBody TulajokAdatai bejovoAdatok) {
        
        
        if (bejovoAdatok.getId() != null) {
            
            
            TulajokAdatai letezo = tulajokAdataiRepository.findById(bejovoAdatok.getId()).orElse(null);
            
            if (letezo != null) {
                
                letezo.setTeljesNev(bejovoAdatok.getTeljesNev());
                letezo.setEmail(bejovoAdatok.getEmail());
                letezo.setTelefon(bejovoAdatok.getTelefon());
                
                
                
                TulajokAdatai frissitett = tulajokAdataiRepository.save(letezo);
                return ResponseEntity.ok(frissitett);
            }
        }
        
        
        
        
        
        TulajokAdatai uj = tulajokAdataiRepository.save(bejovoAdatok);
        return ResponseEntity.ok(uj);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getTulajdonosAdatok(@PathVariable Integer id) {
        
        TulajokAdatai tulaj = tulajokAdataiRepository.findById(id).orElse(null);
        
        if (tulaj != null) {
            
            return ResponseEntity.ok(tulaj);
        } else {
            
            return ResponseEntity.notFound().build();
        }
    }
}