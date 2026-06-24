package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.dto.AuthResponse;
import com.telehealth.pro.dto.LoginRequest;
import com.telehealth.pro.dto.RegisterRequest;
import com.telehealth.pro.dto.TokenRequest;
import com.telehealth.pro.entity.Doctor;
import com.telehealth.pro.entity.Patient;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.DoctorRepository;
import com.telehealth.pro.repository.PatientRepository;
import com.telehealth.pro.repository.UserRepository;
import com.telehealth.pro.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty() ||
                request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty() ||
                request.getRole() == null || request.getRole().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("All fields are required."));
        }

        String role = request.getRole().toLowerCase();
        if (!Arrays.asList("patient", "doctor", "admin").contains(role)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid user role."));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered."));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);

        Long profileId = null;
        if ("patient".equals(role)) {
            Patient patient = Patient.builder()
                    .user(user)
                    .build();
            patient = patientRepository.save(patient);
            profileId = patient.getPatientId();
        } else if ("doctor".equals(role)) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .verificationStatus("pending")
                    .build();
            doctor = doctorRepository.save(doctor);
            profileId = doctor.getDoctorId();
        }

        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        AuthResponse.Tokens tokens = AuthResponse.Tokens.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        AuthResponse.UserDetails userDetails = AuthResponse.UserDetails.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileId(profileId)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.builder()
                        .success(true)
                        .message("User registered successfully.")
                        .tokens(tokens)
                        .user(userDetails)
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email and password are required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials."));
        }

        User user = userOpt.get();
        Long profileId = null;
        String doctorVerificationStatus = null;

        if ("patient".equals(user.getRole())) {
            Optional<Patient> patientOpt = patientRepository.findByUser_Id(user.getId());
            if (patientOpt.isPresent()) {
                profileId = patientOpt.get().getPatientId();
            }
        } else if ("doctor".equals(user.getRole())) {
            Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(user.getId());
            if (doctorOpt.isPresent()) {
                profileId = doctorOpt.get().getDoctorId();
                doctorVerificationStatus = doctorOpt.get().getVerificationStatus();
            }
        }

        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        AuthResponse.Tokens tokens = AuthResponse.Tokens.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        AuthResponse.UserDetails userDetails = AuthResponse.UserDetails.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileId(profileId)
                .doctorVerificationStatus(doctorVerificationStatus)
                .build();

        return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("Logged in successfully.")
                .tokens(tokens)
                .user(userDetails)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Logged out successfully.")
                .build());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRequest request) {
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Refresh token is required."));
        }

        if (!tokenProvider.validateRefreshToken(request.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired refresh token."));
        }

        String email = tokenProvider.getEmailFromRefreshJwt(request.getToken());
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not found."));
        }

        User user = userOpt.get();
        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        AuthResponse.Tokens tokens = AuthResponse.Tokens.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .tokens(tokens)
                .build());
    }
}
