import React from 'react';
import { X, Printer, Calendar, Building, CheckCircle2 } from 'lucide-react';

export default function ReportPrintModal({ report, onClose }) {
  if (!report) return null;

  const formatDate = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  const students = report.student_attendance || [];
  const mess = report.mess_report || {};
  const committee = report.committee_visits || {};
  const security = report.security_attendance || [];
  const housekeeping = report.housekeeping_attendance || [];
  const warden = report.warden_attendance || {};

  const totalAdmittedSum = students.reduce((acc, r) => acc + (parseInt(r.total_admitted, 10) || 0), 0);
  const totalPresentSum = students.reduce((acc, r) => acc + (parseInt(r.students_present, 10) || 0), 0);
  const totalAbsentPermSum = students.reduce((acc, r) => acc + (parseInt(r.absent_with_permission, 10) || 0), 0);
  const totalAbsentUnpermSum = students.reduce((acc, r) => acc + (parseInt(r.absent_without_permission, 10) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }} className="no-print">
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Daily Hostel Report Document
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" style={{ width: 'auto' }} onClick={handlePrint}>
              <Printer size={18} />
              <span>Print / Export PDF</span>
            </button>
            <button className="btn-secondary" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div className="printable-report" style={{ color: '#000000', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              DAILY HOSTEL REPORT
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <div>NAME OF THE HOSTEL : {report.hostel_name || 'BOYS HOSTEL'}</div>
            <div>DATE : {formatDate(report.report_date)}</div>
          </div>

          {/* STUDENTS ATTENDANCE */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
            STUDENTS ATTENDANCE
          </div>
          <table className="report-table" style={{ border: '1px solid #000', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '12%', border: '1px solid #000' }}>Name of institution</th>
                <th style={{ width: '8%', border: '1px solid #000' }}>Total admitted</th>
                <th style={{ width: '8%', border: '1px solid #000' }}>No of Present</th>
                <th style={{ width: '10%', border: '1px solid #000' }}>Absent with permission</th>
                <th style={{ width: '10%', border: '1px solid #000' }}>Absent without permission</th>
                <th style={{ width: '16%', border: '1px solid #000' }}>Name of students without permission</th>
                <th style={{ width: '10%', border: '1px solid #000' }}>Time informing parents</th>
                <th style={{ width: '12%', border: '1px solid #000' }}>Parent contact no.</th>
                <th style={{ width: '14%', border: '1px solid #000' }}>Remarks / reason</th>
              </tr>
            </thead>
            <tbody>
              {students.map((r, idx) => {
                const showCategory = idx === 0 || students[idx - 1].category !== r.category;
                return (
                  <React.Fragment key={idx}>
                    {showCategory && (
                      <tr>
                        <td colSpan="9" style={{ fontWeight: 700, background: '#e2e8f0', textAlign: 'center', border: '1px solid #000', fontSize: '0.8rem' }}>
                          {r.category}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ border: '1px solid #000', fontWeight: 600, textAlign: 'center' }}>{r.institution_code}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{r.total_admitted}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{r.students_present}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{r.absent_with_permission}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{r.absent_without_permission}</td>
                      <td style={{ border: '1px solid #000', fontSize: '0.8rem' }}>{r.unpermitted_student_names || '-'}</td>
                      <td style={{ border: '1px solid #000', fontSize: '0.8rem', textAlign: 'center' }}>{r.time_informed_parents || '-'}</td>
                      <td style={{ border: '1px solid #000', fontSize: '0.8rem', textAlign: 'center' }}>{r.parent_contact_no || '-'}</td>
                      <td style={{ border: '1px solid #000', fontSize: '0.8rem' }}>{r.remarks || '-'}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr style={{ fontWeight: 700, background: '#f1f5f9' }}>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>GRANT TOTAL</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{totalAdmittedSum}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{totalPresentSum}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{totalAbsentPermSum}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{totalAbsentUnpermSum}</td>
                <td colSpan="4" style={{ border: '1px solid #000' }}></td>
              </tr>
            </tbody>
          </table>

          {/* MESS REPORT */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
            MESS REPORT - FEEDBACK BY FACULTY ON MESS WHICH NEED CORRECTIVE ACTIONS
          </div>
          <table className="report-table" style={{ border: '1px solid #000', marginBottom: '1rem' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', fontWeight: 700, border: '1px solid #000' }}>BREAKFAST</td>
                <td style={{ border: '1px solid #000' }}>{mess.breakfast_feedback || 'Okay'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, border: '1px solid #000' }}>LUNCH</td>
                <td style={{ border: '1px solid #000' }}>{mess.lunch_feedback || 'Okay'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, border: '1px solid #000' }}>DINNER</td>
                <td style={{ border: '1px solid #000' }}>{mess.dinner_feedback || 'Okay'}</td>
              </tr>
            </tbody>
          </table>

          {/* MAINTENANCE WORK */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
            MAINTENANCE WORK
          </div>
          <div style={{ border: '1px solid #000', padding: '0.5rem', minHeight: '50px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <strong>LONG PENDING AND PRIORITY WORK:</strong> {report.maintenance_work || 'None reported.'}
          </div>

          {/* COMMITTEE VISIT */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
            COMMITTEE VISIT
          </div>
          <table className="report-table" style={{ border: '1px solid #000', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000' }}>AntiRagging / Discipline</th>
                <th style={{ border: '1px solid #000' }}>BH II (Yes/No)</th>
                <th style={{ border: '1px solid #000' }}>OMV (Yes/No)</th>
                <th style={{ border: '1px solid #000' }}>SGN (Yes/No)</th>
                <th style={{ border: '1px solid #000' }}>JAYAMEENA (Yes/No)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, border: '1px solid #000', textAlign: 'center' }}>Visit Status</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{committee.bh_ii_status || 'Yes'}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{committee.omv_status || 'Yes'}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{committee.sgn_status || 'Yes'}</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{committee.jayameena_status || 'Yes'}</td>
              </tr>
            </tbody>
          </table>

          {/* SECURITY ATTENDANCE */}
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
            SECURITY ATTENDANCE
          </div>
          <table className="report-table" style={{ border: '1px solid #000', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th rowSpan="2" style={{ border: '1px solid #000' }}>Designation</th>
                <th rowSpan="2" style={{ border: '1px solid #000' }}>Allotted Nos.</th>
                <th colSpan="2" style={{ border: '1px solid #000' }}>PRESENT</th>
                <th colSpan="2" style={{ border: '1px solid #000' }}>ABSENT</th>
                <th colSpan="2" style={{ border: '1px solid #000' }}>VACANCY</th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #000' }}>Day shift</th>
                <th style={{ border: '1px solid #000' }}>Night shift</th>
                <th style={{ border: '1px solid #000' }}>Day shift</th>
                <th style={{ border: '1px solid #000' }}>Night shift</th>
                <th style={{ border: '1px solid #000' }}>Day shift</th>
                <th style={{ border: '1px solid #000' }}>Night shift</th>
              </tr>
            </thead>
            <tbody>
              {security.map((sec, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, border: '1px solid #000' }}>{sec.designation}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.allotted_nos}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.present_day}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.present_night}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.absent_day}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.absent_night}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.vacancy_day}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{sec.vacancy_night}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* HOUSEKEEPING & WARDEN ATTENDANCE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
                HOUSE KEEPING ATTENDANCE
              </div>
              <table className="report-table" style={{ border: '1px solid #000' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000' }}>Designation</th>
                    <th style={{ border: '1px solid #000' }}>Allotted</th>
                    <th style={{ border: '1px solid #000' }}>Present</th>
                    <th style={{ border: '1px solid #000' }}>Absent</th>
                    <th style={{ border: '1px solid #000' }}>Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  {housekeeping.map((hk, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, border: '1px solid #000' }}>{hk.designation}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{hk.allotted_nos}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{hk.present_count}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{hk.absent_count}</td>
                      <td style={{ border: '1px solid #000', textAlign: 'center' }}>{hk.vacancy_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: '#f1f5f9', padding: '0.3rem', border: '1px solid #000', borderBottom: 'none' }}>
                WARDEN ATTENDANCE
              </div>
              <table className="report-table" style={{ border: '1px solid #000' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000' }}>Designation</th>
                    <th style={{ border: '1px solid #000' }}>Allotted</th>
                    <th style={{ border: '1px solid #000' }}>Present</th>
                    <th style={{ border: '1px solid #000' }}>Absent</th>
                    <th style={{ border: '1px solid #000' }}>Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, border: '1px solid #000' }}>WARDENS</td>
                    <td style={{ border: '1px solid #000', textAlign: 'center' }}>{warden.allotted_nos || 6}</td>
                    <td style={{ border: '1px solid #000', textAlign: 'center' }}>{warden.present_count || 4}</td>
                    <td style={{ border: '1px solid #000', textAlign: 'center' }}>{warden.absent_count || 0}</td>
                    <td style={{ border: '1px solid #000', textAlign: 'center' }}>{warden.vacancy_count || 2}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="signature-block" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ textDecoration: 'underline', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                {report.warden_signature_name || 'M. Vincent Raman'}
              </div>
              <div style={{ borderTop: '1px solid #000', paddingTop: '0.25rem', fontWeight: 700, width: '220px' }}>
                SIGNATURE OF WARDEN
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: '0.25rem', fontWeight: 700, width: '240px' }}>
                SIGNATURE OF DEAN (SA)
              </div>
              {report.dean_approval_remarks && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Remarks: {report.dean_approval_remarks}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
