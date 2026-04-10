package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.User;
import com.nightout_reserve.backend.repositories.UserRepository;
import com.nightout_reserve.backend.services.UserService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.bind.MethodArgumentNotValidException;
import jakarta.validation.Valid;

import com.nightout_reserve.backend.dto.UserProfileUpdateRequestDTO;
import com.nightout_reserve.backend.dto.UserRegistrationDTO;


import java.util.List;
@CrossOrigin(origins = "http://localhost:3000") // Engedélyezzük a frontendnek a hozzáférést
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @GetMapping("/id/{userId}")
    public User getUserById(@PathVariable Integer userId){
        return userService.getUserById(userId);
    }


    @GetMapping("/email/{userEmail}")
    public User getUserByEmail(@PathVariable String userEmail){
        return userService.getUserByEmail(userEmail);
    }

    @GetMapping("/phone/{userPhone}")
    public User getUserById(@PathVariable String userPhone){
        return userService.getUserByPhone(userPhone);
    }


    @GetMapping("/search/{usernameLike}")
    public List<User> getUsersByUsernameLike(@PathVariable String usernameLike){
        return userService.getUsersByUsernameLike(usernameLike);
    }

  @PostMapping("/create")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
    // A service-nek adjuk át a DTO-t
    User newUser = userService.createUser(registrationDTO);
    return new ResponseEntity<>(newUser, HttpStatus.CREATED);
}

    @PutMapping("/update/{userId}")
    public User updateUser(@PathVariable Integer userId,@RequestBody User user){
        return userService.updateUserById(userId, user);
    }


    @PatchMapping("/softDelete/{userId}")
    public User softDeleteUser(@PathVariable Integer userId){
        return userService.softDeleteUserById(userId);
    }

    @DeleteMapping("/hardDelete/{userId}")
    public String hardDeleteUser(@PathVariable Integer userId){
        userService.hardDeleteUserById(userId);

        return  "user with id: "+userId+" successfully deleted";
    }



        @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ---------------------------------------------------------
    // 1. VÉGPONT: ADATOK BETÖLTÉSE (Amikor megnyílik a profil oldal)
    // ---------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElse(null);
        
        if (user != null) {
            // FONTOS: Valós rendszerben sosem küldjük ki a jelszó hash-t a frontendnek!
            // Ezt lenullázhatjuk a kiküldés előtt a memóriában (az adatbázisban megmarad).
            user.setPassword(null); 
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ---------------------------------------------------------
    // 2. VÉGPONT: ADATOK FRISSÍTÉSE (Amikor rányom a Mentés gombra)
    // ---------------------------------------------------------
    @PostMapping("/update")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileUpdateRequestDTO request) {
        
        // Ellenőrizzük, hogy kaptunk-e ID-t
        if (request.getId() == null) {
            return ResponseEntity.badRequest().body("Hiányzik a felhasználó azonosítója!");
        }

        // 1. Kikeresjük a meglévő felhasználót az adatbázisból
        User letezoUser = userRepository.findById(request.getId()).orElse(null);

        if (letezoUser != null) {
            // 2. Felülírjuk CSAK azt a 3 adatot, amit a felhasználó módosíthat
            // ⚠️ FIGYELJ: Ha nálad setTeljesNev() vagy setTelefonszam() van, írd át!
            letezoUser.setUsername(request.getNev());
            letezoUser.setEmail(request.getEmail());
            letezoUser.setPhone(request.getTelefon());
            
            // A jelszó (letezoUser.getJelszo()) és a dátum érintetlen marad!

            // 3. Elmentjük az adatbázisba az új állapotot
            userRepository.save(letezoUser);
            
            return ResponseEntity.ok("Profil sikeresen frissítve!");
        } else {
            return ResponseEntity.status(404).body("Felhasználó nem található!");
        }
    }

}
