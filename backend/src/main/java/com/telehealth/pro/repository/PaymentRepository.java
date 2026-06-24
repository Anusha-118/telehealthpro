package com.telehealth.pro.repository;

import com.telehealth.pro.entity.Payment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByAppointmentAppointmentId(Long appointmentId);

    @Query("SELECT p FROM Payment p JOIN p.appointment a " +
           "WHERE p.paymentStatus = 'paid' " +
           "AND a.doctor.doctorId = :doctorId " +
           "AND a.status = 'completed'")
    List<Payment> findCompletedEarningsForDoctor(@Param("doctorId") Long doctorId);

    List<Payment> findAllByAppointmentPatientPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Payment> findAllByAppointmentDoctorDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT p FROM Payment p ORDER BY p.createdAt DESC")
    List<Payment> findRecentPayments(Pageable pageable);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'paid'")
    Double sumTotalRevenue();
}
