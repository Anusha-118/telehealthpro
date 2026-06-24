package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.MedicalReport;
import com.telehealth.pro.entity.Patient;
import com.telehealth.pro.entity.User;
import com.telehealth.pro.repository.MedicalReportRepository;
import com.telehealth.pro.repository.PatientRepository;
import com.telehealth.pro.security.CustomUserDetails;
import com.telehealth.pro.service.CloudinaryService;
import com.telehealth.pro.service.UploadResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> uploadReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("report") MultipartFile file,
            @RequestParam("title") String title) {
        
        User currentUser = userDetails.getUser();

        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Please upload a PDF or image medical report."));
        }

        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Report title is required."));
        }

        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }
        Patient patient = patientOpt.get();

        try {
            UploadResult uploadResult = cloudinaryService.uploadFile(file, "medical_reports");

            MedicalReport report = MedicalReport.builder()
                    .patient(patient)
                    .fileUrl(uploadResult.getUrl())
                    .title(title)
                    .build();

            report = medicalReportRepository.save(report);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Medical report uploaded successfully.", report));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload medical report."));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> listReports(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }

        List<MedicalReport> reports = medicalReportRepository
                .findAllByPatientPatientIdOrderByCreatedAtDesc(patientOpt.get().getPatientId());
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getReportDetails(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        User currentUser = userDetails.getUser();
        Optional<MedicalReport> reportOpt = medicalReportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Report not found."));
        }
        MedicalReport report = reportOpt.get();

        boolean isOwner = report.getPatient().getUser().getId().equals(currentUser.getId());
        boolean isDoctorOrAdmin = Arrays.asList("doctor", "admin").contains(currentUser.getRole());

        if (!isOwner && !isDoctorOrAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Not authorized to view this medical report."));
        }

        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> deleteReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }
        Patient patient = patientOpt.get();

        Optional<MedicalReport> reportOpt = medicalReportRepository
                .findByReportIdAndPatientPatientId(id, patient.getPatientId());
        if (reportOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Report not found or not owned by you."));
        }
        MedicalReport report = reportOpt.get();

        // Extract filename from URL
        String fileUrl = report.getFileUrl();
        String publicId = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        if (fileUrl.contains("cloudinary")) {
            String[] parts = fileUrl.split("/");
            String filename = parts[parts.length - 1];
            String folder = parts[parts.length - 2];
            publicId = folder + "/" + filename.substring(0, filename.lastIndexOf("."));
        }

        cloudinaryService.deleteFile(publicId);
        medicalReportRepository.delete(report);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Medical report deleted successfully.")
                .build());
    }
}
