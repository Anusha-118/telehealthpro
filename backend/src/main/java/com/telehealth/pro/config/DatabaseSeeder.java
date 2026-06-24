package com.telehealth.pro.config;

import com.telehealth.pro.entity.Doctor;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.DoctorRepository;
import com.telehealth.pro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedDoctorProfiles();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@telehealth.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("Admin System")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("password123"))
                    .role("admin")
                    .build();
            userRepository.save(admin);
            System.out.println("[SEED] Default admin user seeded: " + adminEmail);
        }
    }

    private void seedDoctorProfiles() {
        System.out.println("Checking database and seeding doctor profiles...");

        List<SeedDoctor> doctorsData = new ArrayList<>();
        doctorsData.add(new SeedDoctor("Dr. Sarah Jenkins", "sarah.jenkins@telehealth.com", "Cardiology", "MBBS, MD, FACC", 12, 150.00));
        doctorsData.add(new SeedDoctor("Dr. Robert Chen", "robert.chen@telehealth.com", "Neurology", "MD, PhD", 15, 200.00));
        doctorsData.add(new SeedDoctor("Dr. Amanda Ross", "amanda.ross@telehealth.com", "Pediatrics", "MD, IBCLC", 8, 90.00));
        doctorsData.add(new SeedDoctor("Dr. John Watson", "john.watson@telehealth.com", "General Medicine", "MD, Generalist", 10, 80.00));
        doctorsData.add(new SeedDoctor("Dr. Elena Rostova", "elena.rostova@telehealth.com", "Dermatology", "MD, FAAD", 7, 110.00));
        doctorsData.add(new SeedDoctor("Dr. Marcus Vance", "marcus.vance@telehealth.com", "Psychiatry", "MD, Psychiatrist", 14, 160.00));
        doctorsData.add(new SeedDoctor("Dr. Gregory House", "gregory.house@telehealth.com", "General Medicine", "MD, Diagnostics Specialist", 20, 250.00));
        doctorsData.add(new SeedDoctor("Dr. Meredith Grey", "meredith.grey@telehealth.com", "General Medicine", "MD, FACS", 11, 180.00));
        doctorsData.add(new SeedDoctor("Dr. Shaun Murphy", "shaun.murphy@telehealth.com", "Pediatrics", "MD, Surgery Specialist", 6, 95.00));
        doctorsData.add(new SeedDoctor("Dr. Stephen Strange", "stephen.strange@telehealth.com", "Neurology", "MD, PhD, Neurosurgery", 16, 220.00));
        doctorsData.add(new SeedDoctor("Dr. Miranda Bailey", "miranda.bailey@telehealth.com", "General Medicine", "MD, Chief Surgeon", 18, 170.00));
        doctorsData.add(new SeedDoctor("Dr. Allison Cameron", "allison.cameron@telehealth.com", "Dermatology", "MD, Immunology Fellow", 9, 130.00));

        int newSeedCount = 0;
        for (SeedDoctor sd : doctorsData) {
            Optional<User> userOpt = userRepository.findByEmail(sd.email);
            if (userOpt.isEmpty()) {
                User user = User.builder()
                        .name(sd.name)
                        .email(sd.email)
                        .password(passwordEncoder.encode("password123"))
                        .role("doctor")
                        .build();
                user = userRepository.save(user);

                Doctor doctor = Doctor.builder()
                        .user(user)
                        .specialization(sd.specialization)
                        .qualification(sd.qualification)
                        .experience(sd.experience)
                        .consultationFee(BigDecimal.valueOf(sd.consultationFee))
                        .verificationStatus("approved")
                        .build();
                doctorRepository.save(doctor);
                newSeedCount++;
            }
        }

        if (newSeedCount > 0) {
            System.out.println("Seeded " + newSeedCount + " new doctor profiles successfully.");
        } else {
            System.out.println("All doctor profiles are already present in the database.");
        }
    }

    private static class SeedDoctor {
        String name;
        String email;
        String specialization;
        String qualification;
        int experience;
        double consultationFee;

        SeedDoctor(String name, String email, String specialization, String qualification, int experience, double consultationFee) {
            this.name = name;
            this.email = email;
            this.specialization = specialization;
            this.qualification = qualification;
            this.experience = experience;
            this.consultationFee = consultationFee;
        }
    }
}
