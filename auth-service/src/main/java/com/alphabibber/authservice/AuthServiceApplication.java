package com.alphabibber.authservice;

import com.alphabibber.authservice.model.User;
import com.alphabibber.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

@SpringBootApplication
public class AuthServiceApplication implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceApplication.class);

    @Autowired
    DataSource dataSource;

    @Autowired
    private Environment env;

    @Autowired
    UserRepository userRepository;

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Override
    public void run(String... args) {

        log.info("Datasource = " + dataSource);

        if (this.activeProfile.equals("dev")) {

            String sub = env.getProperty("CHRIS_SUB_ID");
            String refreshToken = env.getProperty("CHRIS_REFRESH_TOKEN");

            User christopher = new User(sub, refreshToken);
            userRepository.save(christopher);

        }
    }

}
