const { MedicalReport, Patient, User } = require('../models');
const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const fs = require('fs');

const uploadReport = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or image medical report.' });
    }

    if (!title) {
      // Clean up the staged file if title validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Report title is required.' });
    }

    // 1. Fetch Patient details
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // 2. Upload to Cloudinary / Local storage fallback
    const uploadResult = await uploadFile(req.file.path, 'medical_reports');

    // 3. Save report record
    const report = await MedicalReport.create({
      patient_id: patient.patient_id,
      file_url: uploadResult.url,
      title: title
    });

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully.',
      data: report
    });
  } catch (error) {
    console.error('Upload Report Error:', error);
    // Cleanup staged files if left over
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Failed to upload medical report.' });
  }
};

const listReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const reports = await MedicalReport.findAll({
      where: { patient_id: patient.patient_id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('List Reports Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
};

const getReportDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await MedicalReport.findByPk(id, {
      include: [{ model: Patient, include: [{ model: User, attributes: ['name', 'id'] }] }]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Auth checks: User must be either the owner (patient) or a doctor/admin
    const userId = req.user.id;
    const isOwner = report.Patient.user_id === userId;
    const isDoctorOrAdmin = ['doctor', 'admin'].includes(req.user.role);

    if (!isOwner && !isDoctorOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this medical report.' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Get Report Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve report details.' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const report = await MedicalReport.findOne({
      where: { report_id: id, patient_id: patient.patient_id }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found or not owned by you.' });
    }

    // Try to parse file ID for storage deletion
    // For local fallback, file name is stored. For Cloudinary, public_id might be extractable.
    let publicId = report.file_url.split('/').pop(); // fallback guess
    if (report.file_url.includes('cloudinary')) {
      const parts = report.file_url.split('/');
      const filename = parts.pop();
      const folderName = parts.pop();
      publicId = `${folderName}/${filename.split('.')[0]}`;
    }

    await deleteFile(publicId);
    await report.destroy();

    res.status(200).json({ success: true, message: 'Medical report deleted successfully.' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete report.' });
  }
};

module.exports = {
  uploadReport,
  listReports,
  getReportDetails,
  deleteReport
};
