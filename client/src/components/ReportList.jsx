import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search, Calendar, Building, FileText, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import ReportPrintModal from './ReportPrintModal';

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [fullReport, setFullReport] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/reports');
      setReports(res.reports || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = async (id) => {
    setSelectedReportId(id);
    setLoadingModal(true);
    try {
      const res = await apiFetch(`/reports/${id}`);
      setFullReport(res.report);
    } catch (err) {
      alert('Could not load report details: ' + err.message);
      setSelectedReportId(null);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDeleteReport = async (id, dateStr) => {
    if (!window.confirm(`Are you sure you want to delete report for date ${dateStr}?`)) {
      return;
    }
    try {
      await apiFetch(`/reports/${id}`, { method: 'DELETE' });
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const reportDate = new Date(r.report_date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // Text search filter
    const textMatch = !searchTerm || (
      (r.hostel_name && r.hostel_name.toLowerCase().includes(term)) ||
      (r.warden_signature_name && r.warden_signature_name.toLowerCase().includes(term)) ||
      (r.report_date && r.report_date.includes(term))
    );

    // Date range filter
    const dateMatch = (!from || reportDate >= from) && (!to || reportDate <= to);

    return textMatch && dateMatch;
  });

  return (
    <div className="report-card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Submitted Daily Hostel Reports
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Browse historical records stored in PostgreSQL database
        </p>

        {/* Date Filter Section */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
          {/* From Date Filter */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.4rem' }}>
              From Date
            </label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* To Date Filter */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.4rem' }}>
              To Date
            </label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Reset Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setSearchTerm('');
              }}
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#e2e8f0',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#cbd5e1'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search date, warden, hostel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading saved reports...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px border-dashed #cbd5e1' }}>
          <FileText size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '0.25rem' }}>No Reports Found</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Submit your first Daily Hostel Report using the form above.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>ID</th>
                <th style={{ width: '25%' }}>Hostel Name</th>
                <th style={{ width: '20%' }}>Report Date</th>
                <th style={{ width: '25%' }}>Warden Signature</th>
                <th style={{ width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((rep) => (
                <tr key={rep.id}>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>#{rep.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={16} color="#0284c7" />
                      <span>{rep.hostel_name || 'BOYS HOSTEL'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                      <Calendar size={16} color="#059669" />
                      <span>{new Date(rep.report_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td>{rep.warden_signature_name || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => handleViewReport(rep.id)}>
                        <Eye size={14} />
                        <span>View / Print</span>
                      </button>
                      <button className="btn-danger" onClick={() => handleDeleteReport(rep.id, rep.report_date)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReportId && fullReport && (
        <ReportPrintModal report={fullReport} onClose={() => setSelectedReportId(null)} />
      )}
    </div>
  );
}
