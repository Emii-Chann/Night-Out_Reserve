package com.nightout_reserve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;

@SpringBootApplication
public class BackendApplication {
    


	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}


}
