package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.*;
import com.telehealth.pro.repository.*;
import com.telehealth.pro.security.CustomUserDetails;
import com.telehealth.pro.service.EmailService;
import com.telehealth.pro.service.SocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SocketService socketService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();

        Double totalRevenue = paymentRepository.sumTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        List<Payment> recentPayments = paymentRepository.findRecentPayments(PageRequest.of(0, 5));
        
        List<Appointment> recentAppointments = appointmentRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<Object[]> groupResult = appointmentRepository.countAppointmentsGroupByStatus();
        List<Map<String, Object>> appointmentsByStatus = new ArrayList<>();
        for (Object[] row : groupResult) {
            Map<String, Object> m = new HashMap<>();
            m.put("status", row[0]);
            m.put("count", row[1]);
            appointmentsByStatus.add(m);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalAppointments", totalAppointments);
        stats.put("totalRevenue", totalRevenue);

        Map<String, Object> data = new HashMap<>();
        data.put("stats", stats);
        data.put("recentPayments", recentPayments);
        data.put("recentAppointments", recentAppointments);
        data.put("appointmentsByStatus", appointmentsByStatus);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/doctors")
    public ResponseEntity<?> listDoctors() {
        List<Doctor> doctors = doctorRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/patients")
    public ResponseEntity<?> listPatients() {
        List<Patient> patients = patientRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @PutMapping("/doctors/{doctorId}/verify")
    @Transactional
    public ResponseEntity<?> toggleDoctorVerification(
            @PathVariable Long doctorId,
            @RequestBody Map<String, String> body) {
        
        String status = body.get("status");

        if (!Arrays.asList("approved", "rejected", "pending").contains(status)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid verification status state."));
        }

        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor not found."));
        }

        Doctor doctor = doctorOpt.get();
        doctor.setVerificationStatus(status);
        doctor = doctorRepository.save(doctor);

        // Notify Doctor
        String alertTitle = "Registration Status: " + status.toUpperCase();
        String alertMsg = "Admin has updated your verification status to: " + status + ". " +
                ("approved".equals(status)
                        ? "You can now accept consultations!"
                        : "Please verify your credentials or contact support.");

        Notification notification = Notification.builder()
                .user(doctor.getUser())
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Realtime WS push and email dispatch
        socketService.notifyUser(doctor.getUser().getId(), notification);
        emailService.sendEmail(doctor.getUser().getEmail(), alertTitle, alertMsg, "<p>" + alertMsg + "</p>");

        return ResponseEntity.ok(ApiResponse.success("Doctor status updated to " + status + " successfully.", doctor));
    }
}
