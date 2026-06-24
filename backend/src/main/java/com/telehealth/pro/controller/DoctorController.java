package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.Doctor;
import com.telehealth.pro.entity.Payment;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.DoctorRepository;
import com.telehealth.pro.repository.PaymentRepository;
import com.telehealth.pro.repository.UserRepository;
import com.telehealth.pro.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // Public list/search directory
    @GetMapping
    public ResponseEntity<?> listDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String search) {
        
        List<Doctor> doctors = doctorRepository.findFilteredDoctors("approved", specialization, search);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    // Public details page
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getDoctorDetails(@PathVariable Long id) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(id);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor not found."));
        }
        return ResponseEntity.ok(ApiResponse.success(doctorOpt.get()));
    }

    // Private profile (doctor role)
    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor profile not found."));
        }
        return ResponseEntity.ok(ApiResponse.success(doctorOpt.get()));
    }

    // Private update profile (doctor role)
    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, Object> body) {
        User currentUser = userDetails.getUser();
        Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor profile not found."));
        }

        String name = (String) body.get("name");
        String specialization = (String) body.get("specialization");
        String qualification = (String) body.get("qualification");
        Integer experience = body.get("experience") != null ? ((Number) body.get("experience")).intValue() : null;
        BigDecimal consultationFee = body.get("consultation_fee") != null ? new BigDecimal(body.get("consultation_fee").toString()) : null;

        if (name != null && !name.trim().isEmpty()) {
            currentUser.setName(name);
            userRepository.save(currentUser);
        }

        Doctor doctor = doctorOpt.get();
        if (specialization != null) doctor.setSpecialization(specialization);
        if (qualification != null) doctor.setQualification(qualification);
        if (experience != null) doctor.setExperience(experience);
        if (consultationFee != null) doctor.setConsultationFee(consultationFee);

        doctor = doctorRepository.save(doctor);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", doctor));
    }

    // Private earnings dashboard (doctor role)
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getEarnings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor profile not found."));
        }

        Doctor doctor = doctorOpt.get();
        List<Payment> completedPayments = paymentRepository.findCompletedEarningsForDoctor(doctor.getDoctorId());

        double totalEarnings = 0.0;
        Map<String, Double> monthlyData = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

        for (Payment p : completedPayments) {
            double amount = p.getAmount() != null ? p.getAmount().doubleValue() : 0.0;
            totalEarnings += amount;

            if (p.getCreatedAt() != null) {
                String monthKey = p.getCreatedAt().format(formatter);
                monthlyData.put(monthKey, monthlyData.getOrDefault(monthKey, 0.0) + amount);
            }
        }

        List<Map<String, Object>> monthlyAnalytics = new ArrayList<>();
        for (Map.Entry<String, Double> entry : monthlyData.entrySet()) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", entry.getKey());
            m.put("amount", entry.getValue());
            monthlyAnalytics.add(m);
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("totalEarnings", totalEarnings);
        responseData.put("monthlyAnalytics", monthlyAnalytics);
        responseData.put("transactions", completedPayments);

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}
