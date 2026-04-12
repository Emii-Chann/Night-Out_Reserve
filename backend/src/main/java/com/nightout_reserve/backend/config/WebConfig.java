package com.nightout_reserve.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Kiszolgálja az uploads mappa tartalmát a /uploads/** URL-en keresztül
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}