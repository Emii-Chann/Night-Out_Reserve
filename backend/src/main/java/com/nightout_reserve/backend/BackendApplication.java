package com.nightout_reserve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.nightout_reserve.backend", "com.nightout.backend"}) 
@EnableJpaRepositories(basePackages = {"com.nightout_reserve.backend", "com.nightout.backend"})
@EntityScan(basePackages = {"com.nightout_reserve.backend", "com.nightout.backend"})
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}