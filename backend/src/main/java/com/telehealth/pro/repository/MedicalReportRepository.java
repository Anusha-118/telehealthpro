package com.telehealth.pro.repository;

import com.telehealth.pro.entity.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findAllByPatientPatientIdOrderByCreatedAtDesc(Long patientId);
    Optional<MedicalReport> findByReportIdAndPatientPatientId(Long reportId, Long patientId);
}
