package com.sayel.MovieBookingApplication;

import com.sayel.MovieBookingApplication.model.User;
import com.sayel.MovieBookingApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminBootstrapSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_BOOTSTRAP_USERNAME:}")
    private String bootstrapUsername;

    @Value("${ADMIN_BOOTSTRAP_EMAIL:}")
    private String bootstrapEmail;

    @Value("${ADMIN_BOOTSTRAP_PASSWORD:}")
    private String bootstrapPassword;

    @Override
    public void run(String... args) {
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) {
            return;
        }
        if (userRepository.findByUsername(bootstrapUsername).isPresent()) {
            return;
        }

        Set<String> roles = new HashSet<>();
        roles.add("ADMIN");
        roles.add("USER");

        User admin = new User();
        admin.setUsername(bootstrapUsername);
        admin.setEmail(bootstrapEmail.isBlank() ? bootstrapUsername + "@example.com" : bootstrapEmail);
        admin.setPassword(passwordEncoder.encode(bootstrapPassword));
        admin.setRoles(roles);
        userRepository.save(admin);

        System.out.println("Seeded initial admin user: " + bootstrapUsername);
    }
}
