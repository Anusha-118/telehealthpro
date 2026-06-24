package com.telehealth.pro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class TeleHealthProApplication {
    public static void main(String[] args) {
        // Load .env from the current working directory
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        // Also load .env from ./backend folder if running from root directory
        Dotenv dotenvBackend = Dotenv.configure().directory("./backend").ignoreIfMissing().load();
        dotenvBackend.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(TeleHealthProApplication.class, args);
    }
}
