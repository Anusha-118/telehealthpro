package com.telehealth.pro.repository;

import com.telehealth.pro.entity.Doctor;
import com.telehealth.pro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUser_Id(Long userId);

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE d.verificationStatus = :status " +
           "AND (:specialization IS NULL OR d.specialization LIKE %:specialization%) " +
           "AND (:search IS NULL OR u.name LIKE %:search%)")
    List<Doctor> findFilteredDoctors(@Param("status") String status, 
                                     @Param("specialization") String specialization, 
                                     @Param("search") String search);
}
