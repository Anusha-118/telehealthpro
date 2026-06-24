package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.*;
import com.telehealth.pro.repository.*;
import com.telehealth.pro.security.CustomUserDetails;
import com.telehealth.pro.service.SocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SocketService socketService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public ResponseEntity<?> createPrescription(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        
        User currentUser = userDetails.getUser();

        if (body.get("appointment_id") == null || body.get("medicines") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Appointment ID and medicines list are required."));
        }

        Long appointmentId = ((Number) body.get("appointment_id")).longValue();
        String medicines = (String) body.get("medicines");
        String notes = (String) body.get("notes");

        Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only registered doctors can create prescriptions."));
        }
        Doctor doctor = doctorOpt.get();

        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }
        Appointment appointment = appointmentOpt.get();

        if (!appointment.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to prescribe for this appointment."));
        }

        Optional<Prescription> prescriptionOpt = prescriptionRepository.findByAppointmentAppointmentId(appointmentId);
        Prescription prescription;

        if (prescriptionOpt.isPresent()) {
            prescription = prescriptionOpt.get();
            prescription.setMedicines(medicines);
            prescription.setNotes(notes);
            prescription = prescriptionRepository.save(prescription);
        } else {
            prescription = Prescription.builder()
                    .appointment(appointment)
                    .medicines(medicines)
                    .notes(notes)
                    .build();
            prescription = prescriptionRepository.save(prescription);
        }

        // Complete the appointment
        appointment.setStatus("completed");
        appointmentRepository.save(appointment);

        // Notify Patient
        String alertTitle = "New Prescription Uploaded";
        String alertMsg = "Doctor has uploaded your prescription details for appointment on " + appointment.getDate() + ".";

        Notification notification = Notification.builder()
                .user(appointment.getPatient().getUser())
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Emit live socket event
        socketService.notifyUser(appointment.getPatient().getUser().getId(), notification);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Prescription processed successfully and appointment marked as completed.", prescription));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPrescription(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long appointmentId) {
        
        User currentUser = userDetails.getUser();
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findByAppointmentAppointmentId(appointmentId);
        if (prescriptionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Prescription not found."));
        }

        Prescription prescription = prescriptionOpt.get();

        boolean isPatientUser = prescription.getAppointment().getPatient().getUser().getId().equals(currentUser.getId());
        boolean isDoctorUser = prescription.getAppointment().getDoctor().getUser().getId().equals(currentUser.getId());
        boolean isAdminUser = "admin".equals(currentUser.getRole());

        if (!isPatientUser && !isDoctorUser && !isAdminUser) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Not authorized to view this prescription."));
        }

        return ResponseEntity.ok(ApiResponse.success(prescription));
    }
}
