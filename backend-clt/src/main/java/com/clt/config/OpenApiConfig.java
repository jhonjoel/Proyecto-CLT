package com.clt.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(new Server().url("http://localhost:8080").description("Servidor local")))
                .info(new Info()
                        .title("CLT Backend API")
                        .version("1.0")
                        .description("API REST del proyecto CLT. Autenticación mediante JWT. " +
                                "Tras hacer login en POST /api/auth/login se obtienen accessToken y refreshToken. " +
                                "Usar accessToken en el header Authorization: Bearer <accessToken>. " +
                                "Usar POST /api/auth/refresh con refreshToken para renovar ambos tokens.")
                        .contact(new Contact()
                                .name("CLT")
                                .email("admin@clt.com"))
                        .license(new License()
                                .name("Proyecto CLT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH,
                                new SecurityScheme()
                                        .name(BEARER_AUTH)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Access token JWT obtenido de POST /api/auth/login o POST /api/auth/refresh")));
    }
}
