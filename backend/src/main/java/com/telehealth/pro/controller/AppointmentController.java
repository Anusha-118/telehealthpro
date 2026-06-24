package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.*;
import com.telehealth.pro.repository.*;
import com.telehealth.pro.security.CustomUserDetails;
import com.telehealth.pro.service.EmailService;
import com.telehealth.pro.service.SocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

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

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> bookAppointment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        
        User currentUser = userDetails.getUser();
        
        if (body.get("doctor_id") == null || body.get("date") == null || body.get("time") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Doctor ID, date, and time are required."));
        }

        Long doctorId = ((Number) body.get("doctor_id")).longValue();
        String dateStr = (String) body.get("date");
        String timeStr = (String) body.get("time");

        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }
        Patient patient = patientOpt.get();

        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty() || !"approved".equals(doctorOpt.get().getVerificationStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Selected doctor is not available or verified."));
        }
        Doctor doctor = doctorOpt.get();

        LocalDate date = LocalDate.parse(dateStr);
        LocalTime time = LocalTime.parse(timeStr);

        // Check scheduling conflicts
        Optional<Appointment> conflict = appointmentRepository.findConflict(doctorId, date, time, Arrays.asList("pending", "confirmed"));
        if (conflict.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("The doctor already has an appointment booked at this slot."));
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(date)
                .time(time)
                .status("pending")
                .build();

        appointment = appointmentRepository.save(appointment);

        // Pre-create payment record
        Payment payment = Payment.builder()
                .appointment(appointment)
                .amount(doctor.getConsultationFee())
                .paymentStatus("pending")
                .build();
        paymentRepository.save(payment);

        // Notification for Doctor
        String alertTitle = "New Appointment Request";
        String alertMsg = "Patient " + currentUser.getName() + " has requested an appointment on " + dateStr + " at " + timeStr + ".";

        Notification notification = Notification.builder()
                .user(doctor.getUser())
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Realtime WebSockets push & email dispatch
        socketService.notifyUser(doctor.getUser().getId(), notification);
        emailService.sendEmail(doctor.getUser().getEmail(), alertTitle, alertMsg, "<p>" + alertMsg + "</p>");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully. Payment is pending.", appointment));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> listPatientAppointments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }
        
        List<Appointment> appointments = appointmentRepository
                .findAllByPatientPatientIdOrderByDateDescTimeDesc(patientOpt.get().getPatientId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> listDoctorAppointments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor profile not found."));
        }

        List<Appointment> appointments = appointmentRepository
                .findAllByDoctorDoctorIdOrderByDateDescTimeDesc(doctorOpt.get().getDoctorId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Transactional
    public ResponseEntity<?> updateAppointmentStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        User currentUser = userDetails.getUser();
        String status = body.get("status");

        if (!Arrays.asList("confirmed", "completed", "cancelled").contains(status)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status state."));
        }

        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }

        Appointment appointment = appointmentOpt.get();

        if ("patient".equals(currentUser.getRole()) && !"cancelled".equals(status)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Patients can only cancel appointments."));
        }

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        // Notify other user
        Long targetUserId;
        String targetEmail;
        String alertTitle;
        String alertMsg;

        if ("patient".equals(currentUser.getRole())) {
            targetUserId = appointment.getDoctor().getUser().getId();
            targetEmail = appointment.getDoctor().getUser().getEmail();
            alertTitle = "Appointment Cancelled by Patient";
            alertMsg = "Appointment scheduled on " + appointment.getDate() + " was cancelled by Patient " + appointment.getPatient().getUser().getName() + ".";
        } else {
            targetUserId = appointment.getPatient().getUser().getId();
            targetEmail = appointment.getPatient().getUser().getEmail();
            alertTitle = "Appointment status updated: " + status.toUpperCase();
            alertMsg = "Doctor " + appointment.getDoctor().getUser().getName() + " has updated your appointment status to: " + status + ".";
        }

        Notification notification = Notification.builder()
                .user(userRepository.getReferenceById(targetUserId))
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Realtime WebSockets push & email dispatch
        socketService.notifyUser(targetUserId, notification);
        emailService.sendEmail(targetEmail, alertTitle, alertMsg, "<p>" + alertMsg + "</p>");

        return ResponseEntity.ok(ApiResponse.success("Appointment status updated successfully.", appointment));
    }
}
