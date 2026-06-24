package com.telehealth.pro.repository;

import com.telehealth.pro.entity.Patient;
import com.telehealth.pro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser(User user);
    Optional<Patient> findByUser_Id(Long userId);
}
