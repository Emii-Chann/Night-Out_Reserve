package com.nightout_reserve.backend.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER) 
    @JoinColumn(nullable = false, name = "felhasznalo_id") 
    private User felhasznalo; 

    private LocalDateTime lejarat;

    public PasswordResetToken() {}

    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.felhasznalo = user;
        this.lejarat = LocalDateTime.now().plusMinutes(30); 
    }

    
}