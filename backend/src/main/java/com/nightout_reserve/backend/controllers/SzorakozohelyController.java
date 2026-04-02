package com.nightout_reserve.backend.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nightout_reserve.backend.models.Szorakozohely;
import com.nightout_reserve.backend.repositories.SzorakozohelyRepository;


@RestController
@RequestMapping("/api/helyszinek")
@CrossOrigin(origins = "http://localhost:3000")
public class SzorakozohelyController {

    @Autowired
    private SzorakozohelyRepository repo;

    @GetMapping("/list")
    public List<Szorakozohely> getHelyszinek() {
        // A repository-ban megírt metódust hívjuk meg
        return repo.findByTorolveAtIsNull();
    }
}
