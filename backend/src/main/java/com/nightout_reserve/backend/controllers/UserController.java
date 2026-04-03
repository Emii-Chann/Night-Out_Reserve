package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.User;
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


}
