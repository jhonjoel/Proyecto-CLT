package com.clt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CltBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CltBackendApplication.class, args);
    }
}
