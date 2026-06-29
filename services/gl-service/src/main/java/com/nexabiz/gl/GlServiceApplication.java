package com.nexabiz.gl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class GlServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GlServiceApplication.class, args);
    }
}
