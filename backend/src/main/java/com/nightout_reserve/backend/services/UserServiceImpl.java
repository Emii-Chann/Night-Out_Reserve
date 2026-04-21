package com.nightout_reserve.backend.services;


import com.nightout_reserve.backend.models.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nightout_reserve.backend.repositories.UserRepository;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import com.nightout_reserve.backend.dto.UserRegistrationDTO;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.nightout_reserve.backend.repositories.AsztalFoglalasRepository;
import com.nightout_reserve.backend.repositories.HelyFoglalasRepository;
import com.nightout_reserve.backend.repositories.JatekFoglalasRepository;



@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;


    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("User with "+id+" not found")
        );
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User getUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByUsernameLike(String searchByUsername) {
        return userRepository.findUsersByUsernameLike(searchByUsername);
    }

    @Override
    public User createUser(UserRegistrationDTO dto) {
    // 1. Ellenőrizzük, létezik-e már ilyen felhasználó (opcionális, de ajánlott)
    if (userRepository.findByEmail(dto.getEmail()) != null) {
        throw new RuntimeException("Ez az email cím már foglalt!");
    }

    // 2. Entitás létrehozása és adatok másolása
    User user = new User();
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setPhone(dto.getPhone());
    
    // 3. JELSZÓ TITKOSÍTÁSA (BCrypt) - SOHA ne mentsünk sima szöveget!
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    user.setPassword(encoder.encode(dto.getPassword()));

    // 4. Alapértelmezett értékek beállítása
    user.setIsDeleted(false);
    
    return userRepository.save(user);
}

    @Override
    public User updateUserById(Integer userId, User body) {
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with id "+userId+" not found"));

        userToUpdate.setUsername(body.getUsername());
        userToUpdate.setEmail(body.getEmail());

        if (body.getPhone() != null) {
            userToUpdate.setPhone(body.getPhone());
        } else {
            userToUpdate.setPhone(userToUpdate.getPhone());
        }
        return userRepository.save(userToUpdate);
    }

    @Override
    public User softDeleteUserById(Integer id) {
        User userToSoftDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id "+ id+ "not found"));

        userToSoftDelete.setIsDeleted(true);
        userToSoftDelete.setDeletedAt(LocalDateTime.now());

        return userRepository.save(userToSoftDelete);

    }

    @Autowired
    private JatekFoglalasRepository jatekFoglalasRepository;

    @Autowired
    private AsztalFoglalasRepository asztalFoglalasRepository;
    @Autowired
    private HelyFoglalasRepository helyFoglalasRepository;

  @Override
@Transactional // Fontos, hogy ez egy tranzakció legyen!
public void hardDeleteUserById(Integer id) {
    System.out.println("Deleting user with id "+ id);
    
    // 1. Először töröljük a userhez tartozó összes foglalást
    jatekFoglalasRepository.deleteByFelhasznaloId(id);
    asztalFoglalasRepository.deleteByFelhasznaloId(id);
    helyFoglalasRepository.deleteByFelhasznaloId(id);
    
    // 2. Végül törölhetjük magát a usert
    userRepository.deleteById(id);
}
}
