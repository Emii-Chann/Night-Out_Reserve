package com.nightout_reserve.backend.modules;

import jakarta.persistence.*; //important!
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "userprofiles")
public class UserProfiles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    @Getter @Setter
    private String email;

    @Column(nullable = false, unique = true, length = 12)
    @Getter @Setter
    private String username;

    @Column(nullable = false, length = 60)
    @Getter @Setter
    private String password;

    @Column(name = "createdAt", nullable = true, updatable = false)
    @Getter @Setter
    private LocalDateTime createdAt;

    @Column(nullable = true)
    @Getter @Setter
    private LocalDateTime deletedAt;
}