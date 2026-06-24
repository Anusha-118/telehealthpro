package com.telehealth.pro.repository;

import com.telehealth.pro.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findAllByPatientPatientIdOrderByDateDescTimeDesc(Long patientId);
    
    List<Appointment> findAllByDoctorDoctorIdOrderByDateDescTimeDesc(Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId " +
           "AND a.date = :date AND a.time = :time AND a.status IN :statuses")
    Optional<Appointment> findConflict(Long doctorId, LocalDate date, LocalTime time, List<String> statuses);

    @Query("SELECT a.status as status, COUNT(a.appointmentId) as count FROM Appointment a GROUP BY a.status")
    List<Object[]> countAppointmentsGroupByStatus();
}
