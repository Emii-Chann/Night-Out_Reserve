package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.User;
import com.nightout_reserve.backend.services.UserService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;


    //endpoint
    @GetMapping("/")
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }


    @GetMapping("/{userId}")
    public User getUserById(@PathVariable Integer userId){
        return userService.getUserById(userId);
    }










}
