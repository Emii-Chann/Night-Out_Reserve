package com.nightout_reserve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// Kényszerítjük, hogy ebben a csomagban mindent (configot, controllert) keressen meg
@ComponentScan(basePackages = "com.nightout_reserve.backend") 
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}