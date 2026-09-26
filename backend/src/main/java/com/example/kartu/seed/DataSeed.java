package com.example.kartu.seed;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

import com.example.kartu.models.Category;
import com.example.kartu.models.User;
import com.example.kartu.repositories.CategoryRepository;
import com.example.kartu.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Component
@Order(1)
@Slf4j
@RequiredArgsConstructor
public class DataSeed implements CommandLineRunner {

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        seedCategories();
        seedAdmin();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding categories...");
            Category rowOne = new Category( "CD-001","PULSA");
            Category rowTwo = new Category( "CD-002","PAKET DATA");
            categoryRepository.saveAll(List.of(rowOne, rowTwo));
            log.info("Categories seeded successfully.");
        }
    }

    private void seedAdmin() {
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty()) {
            log.info("Seeding default admin...");
            
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail("admin@zelatancell.local");
            admin.setEmailVerified(true);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ROLE_ADMIN");
            admin.setPhoneNumber("081234567890");
            admin.setBalance(0);

            userRepository.save(admin);
            log.info("Admin '{}' created successfully.", adminUsername);
        } else {
            User admin = adminOpt.get();
            boolean changed = false;

            if (adminPassword != null && !adminPassword.isBlank() && !passwordEncoder.matches(adminPassword, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                changed = true;
                log.info("Admin '{}' password synchronized with configuration.", adminUsername);
            }

            if (!"ROLE_ADMIN".equals(admin.getRole())) {
                admin.setRole("ROLE_ADMIN");
                changed = true;
                log.info("Admin '{}' role set to ROLE_ADMIN.", adminUsername);
            }

            if (admin.getEmail() == null || !admin.isEmailVerified()) {
                admin.setEmail("admin@zelatancell.local");
                admin.setEmailVerified(true);
                changed = true;
                log.info("Admin '{}' email and verification status updated.", adminUsername);
            }

            if (changed) {
                userRepository.save(admin);
            }
        }
    }
}
