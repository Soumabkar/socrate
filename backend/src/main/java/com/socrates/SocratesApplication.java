package com.socrates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée de l'application Socrates.
 * @SpringBootApplication active :
 *   - @Configuration  : source de beans Spring
 *   - @EnableAutoConfiguration : configuration automatique du contexte
 *   - @ComponentScan  : détection automatique des composants dans le package
 */
@SpringBootApplication
public class SocratesApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocratesApplication.class, args);
    }
}
