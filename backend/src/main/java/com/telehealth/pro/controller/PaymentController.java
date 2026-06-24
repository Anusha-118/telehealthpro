package com.telehealth.pro.controller;

import com.telehealth.pro.dto.ApiResponse;
import com.telehealth.pro.entity.*;
import com.telehealth.pro.repository.*;
import com.telehealth.pro.security.CustomUserDetails;
import com.telehealth.pro.service.EmailService;
import com.telehealth.pro.service.SocketService;
import com.telehealth.pro.service.StripeIntentResult;
import com.telehealth.pro.service.StripeService;
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
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private SocketService socketService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> checkoutSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        
        if (body.get("appointment_id") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Appointment ID is required."));
        }

        Long appointmentId = ((Number) body.get("appointment_id")).longValue();

        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }
        Appointment appointment = appointmentOpt.get();

        Optional<Payment> paymentOpt = paymentRepository.findByAppointmentAppointmentId(appointmentId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment record not found."));
        }
        Payment payment = paymentOpt.get();

        if ("paid".equals(payment.getPaymentStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Appointment has already been paid for."));
        }

        long amountInCents = Math.round(payment.getAmount().doubleValue() * 100);
        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointment_id", appointment.getAppointmentId().toString());
        metadata.put("patient_name", appointment.getPatient().getUser().getName());

        StripeIntentResult intentResult = stripeService.createPaymentIntent(amountInCents, metadata);

        payment.setStripePaymentIntentId(intentResult.getId());
        paymentRepository.save(payment);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);
        responseData.put("clientSecret", intentResult.getClientSecret());
        responseData.put("paymentId", payment.getPaymentId());
        responseData.put("amount", payment.getAmount());

        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public ResponseEntity<?> confirmPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        
        if (body.get("appointment_id") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Appointment ID is required."));
        }

        Long appointmentId = ((Number) body.get("appointment_id")).longValue();

        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }
        Appointment appointment = appointmentOpt.get();

        Optional<Payment> paymentOpt = paymentRepository.findByAppointmentAppointmentId(appointmentId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment record not found."));
        }
        Payment payment = paymentOpt.get();

        payment.setPaymentStatus("paid");
        paymentRepository.save(payment);

        appointment.setStatus("confirmed");
        appointmentRepository.save(appointment);

        // Notify Doctor
        String alertTitle = "Appointment Confirmed";
        String alertMsg = "Appointment with Patient " + appointment.getPatient().getUser().getName() +
                " on " + appointment.getDate() + " is confirmed (Paid).";

        Notification notification = Notification.builder()
                .user(appointment.getDoctor().getUser())
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Realtime WebSockets and receipt email to Patient
        socketService.notifyUser(appointment.getDoctor().getUser().getId(), notification);

        String emailHtml = "<h3>Invoice Receipt</h3>" +
                "<p>Thank you for booking your consultation with TeleHealth Pro!</p>" +
                "<p><strong>Appointment ID:</strong> #" + appointment.getAppointmentId() + "</p>" +
                "<p><strong>Doctor:</strong> Dr. " + appointment.getDoctor().getUser().getName() + "</p>" +
                "<p><strong>Date:</strong> " + appointment.getDate() + "</p>" +
                "<p><strong>Time:</strong> " + appointment.getTime() + "</p>" +
                "<p><strong>Amount Paid:</strong> $" + payment.getAmount() + " (USD)</p>" +
                "<p><strong>Status:</strong> Paid</p>";

        emailService.sendEmail(
                appointment.getPatient().getUser().getEmail(),
                "Invoice Receipt for Appointment #" + appointment.getAppointmentId(),
                "Thank you for booking! We have received your payment of $" + payment.getAmount() + " for your consultation with Dr. " + appointment.getDoctor().getUser().getName() + " on " + appointment.getDate() + " at " + appointment.getTime() + ".",
                emailHtml
        );

        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully.", payment));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<?> getPaymentHistory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        List<Payment> history;

        if ("patient".equals(currentUser.getRole())) {
            Optional<Patient> patientOpt = patientRepository.findByUser_Id(currentUser.getId());
            if (patientOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Patient profile not found."));
            }
            history = paymentRepository.findAllByAppointmentPatientPatientIdOrderByCreatedAtDesc(patientOpt.get().getPatientId());
        } else {
            Optional<Doctor> doctorOpt = doctorRepository.findByUser_Id(currentUser.getId());
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Doctor profile not found."));
            }
            history = paymentRepository.findAllByAppointmentDoctorDoctorIdOrderByCreatedAtDesc(doctorOpt.get().getDoctorId());
        }

        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> refundPaymentIntent(@PathVariable Long paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment record not found."));
        }
        Payment payment = paymentOpt.get();

        if (!"paid".equals(payment.getPaymentStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Can only refund completed payments."));
        }

        if (payment.getStripePaymentIntentId() != null) {
            stripeService.refundPayment(payment.getStripePaymentIntentId());
        }

        payment.setPaymentStatus("refunded");
        paymentRepository.save(payment);

        Appointment appointment = payment.getAppointment();
        appointment.setStatus("cancelled");
        appointmentRepository.save(appointment);

        // Notify patient
        String alertTitle = "Refund Processed";
        String alertMsg = "Your payment of $" + payment.getAmount() + " for Appointment #" + appointment.getAppointmentId() + " has been refunded.";

        Notification notification = Notification.builder()
                .user(appointment.getPatient().getUser())
                .title(alertTitle)
                .message(alertMsg)
                .build();
        notification = notificationRepository.save(notification);

        // Realtime WS push and email dispatch
        socketService.notifyUser(appointment.getPatient().getUser().getId(), notification);
        emailService.sendEmail(appointment.getPatient().getUser().getEmail(), alertTitle, alertMsg, "<p>" + alertMsg + "</p>");

        return ResponseEntity.ok(ApiResponse.success("Refund successfully completed.", payment));
    }
}
