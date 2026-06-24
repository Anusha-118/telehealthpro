package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.Appointment;
import com.telehealth.pro.entity.MedicalReport;
import com.telehealth.pro.entity.Patient;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.AppointmentRepository;
import com.telehealth.pro.repository.MedicalReportRepository;
import com.telehealth.pro.repository.PatientRepository;
import com.telehealth.pro.repository.UserRepository;
import com.telehealth.pro.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }
        return ResponseEntity.ok(ApiResponse.success(patientOpt.get()));
    }

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, Object> body) {
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }

        String name = (String) body.get("name");
        Integer age = (Integer) body.get("age");
        String gender = (String) body.get("gender");
        String address = (String) body.get("address");
        String bloodGroup = (String) body.get("blood_group");

        if (name != null && !name.trim().isEmpty()) {
            currentUser.setName(name);
            userRepository.save(currentUser);
        }

        Patient patient = patientOpt.get();
        if (age != null) {
            patient.setAge(age);
        }
        if (gender != null) {
            patient.setGender(gender);
        }
        if (address != null) {
            patient.setAddress(address);
        }
        if (bloodGroup != null) {
            patient.setBloodGroup(bloodGroup);
        }

        patient = patientRepository.save(patient);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", patient));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getMedicalHistory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }

        Patient patient = patientOpt.get();
        List<Appointment> appointments = appointmentRepository
                .findAllByPatientPatientIdOrderByDateDescTimeDesc(patient.getPatientId());
        List<MedicalReport> reports = medicalReportRepository
                .findAllByPatientPatientIdOrderByCreatedAtDesc(patient.getPatientId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("appointments", appointments);
        responseData.put("reports", reports);

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}
