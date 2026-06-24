import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Plus, Trash2, ExternalLink, AlertCircle, FilePlus } from 'lucide-react';

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching medical reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Please specify report title and select a file.');
      return;
    }

    try {
      setUploadLoading(true);
      setError('');

      // Form data structure for file uploads
      const formData = new FormData();
      formData.append('title', title);
      formData.append('report', file);

      const res = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setTitle('');
        setFile(null);
        setUploadOpen(false);
        alert('Medical report uploaded successfully!');
        fetchReports();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload file. Please check size/format rules.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;

    try {
      const res = await api.delete(`/reports/${reportId}`);
      if (res.data.success) {
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Medical Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Upload clinical records, diagnostics, lab PDFs, and share them with consulting doctors.</p>
        </div>
        <button
          onClick={() => { setUploadOpen(!uploadOpen); setError(''); }}
          className="flex items-center justify-center space-x-1.5 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl shadow-md hover-scale transition-colors w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Upload Drawer / Card */}
      {uploadOpen && (
        <div className="glass-panel p-6 bg-white/70 dark:bg-darkBg-light/75 border border-slate-200 dark:border-slate-800/80 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-base">New Report Upload</h3>
          
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Record Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Lab Report, X-Ray, Prescriptions..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Upload Document (PDF, JPEG, PNG)</label>
              <input
                type="file"
                required
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-500/10 file:text-primary-750 hover:file:bg-primary-500/20 file:cursor-pointer"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={uploadLoading}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xs hover-scale shadow-md flex justify-center items-center"
              >
                {uploadLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Upload</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-3xl skeleton"></div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <FilePlus className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Records Uploaded</h3>
          <p className="text-slate-450 text-xs mt-1">Upload files here to keep your consultations history structured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((rep) => (
            <div key={rep.report_id} className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between hover-scale">
              <div className="space-y-3">
                <div className="p-3 bg-secondary-500/10 dark:bg-secondary-400/10 rounded-2xl w-fit">
                  <FileText className="h-6 w-6 text-secondary-650 dark:text-secondary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 truncate">{rep.title}</h4>
                  <p className="text-xxs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Uploaded: {new Date(rep.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
                <a
                  href={rep.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs font-semibold text-primary-650 dark:text-primary-400 hover:underline"
                >
                  <span>View File</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(rep.report_id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  aria-label="Delete Report"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReports;
