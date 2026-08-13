import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle2, RotateCcw, Building, Calendar, User, FileText } from 'lucide-react';
import { apiFetch } from '../utils/api';

const defaultStudentData = [
  // SRM-IST(E&T)
  { category: 'SRM-IST(E&T)', institution_code: 'BH-II', total_admitted:0 , students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'SRM-IST(E&T)', institution_code: 'OMV', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'SRM-IST(E&T)', institution_code: 'SGN', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  
  // SRM-IST(S&H)
  { category: 'SRM-IST(S&H)', institution_code: 'BH-II', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'SRM-IST(S&H)', institution_code: 'OMV', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  
  // EASWARI ENGINEERING COLLEGE
  { category: 'EASWARI ENGINEERING COLLEGE', institution_code: 'BH-II', total_admitted: 0, students_present: 0, absent_with_permission: 3, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'EASWARI ENGINEERING COLLEGE', institution_code: 'JM', total_admitted: 0, students_present: 0, absent_with_permission: 8, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'EASWARI ENGINEERING COLLEGE', institution_code: 'OMV', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  
  // SRM-DENTAL
  { category: 'SRM-DENTAL', institution_code: 'BH-II', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'SRM-DENTAL', institution_code: 'SGN', total_admitted: 0, students_present: 0, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
  { category: 'SRM-DENTAL', institution_code: 'OMV', total_admitted: 0, students_present: 4, absent_with_permission: 0, absent_without_permission: 0, unpermitted_student_names: '', time_informed_parents: '', parent_contact_no: '', remarks: '' },
];

const defaultSecurityData = [
  { designation: 'SSO', allotted_nos: 8, present_day: 3, present_night: 4, absent_day: 1, absent_night: 0, vacancy_day: 0, vacancy_night: 0 },
  { designation: 'ASO', allotted_nos: 12, present_day: 5, present_night: 2, absent_day: 1, absent_night: 4, vacancy_day: 0, vacancy_night: 0 },
  { designation: 'SSG', allotted_nos: 8, present_day: 1, present_night: 3, absent_day: 3, absent_night: 1, vacancy_day: 0, vacancy_night: 0 },
];

const defaultHousekeepingData = [
  { designation: 'SWEEPERS', allotted_nos: 48, present_count: 20, absent_count: 4, vacancy_count: 24 },
  { designation: 'SCAVENGERS', allotted_nos: 42, present_count: 17, absent_count: 8, vacancy_count: 17 },
  { designation: 'HK SUPERVISORS', allotted_nos: 2, present_count: 1, absent_count: 0, vacancy_count: 1 },
];

export default function DailyReportForm({ user, onReportSubmitted }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [hostelName, setHostelName] = useState('BOYS HOSTEL');
  const [reportDate, setReportDate] = useState(getToday());
  const [wardenSignature, setWardenSignature] = useState(user?.fullName || 'M. Vincent Raman');
  const [deanRemarks, setDeanRemarks] = useState('');
  const [maintenanceWork, setMaintenanceWork] = useState('');

  const [studentRows, setStudentRows] = useState(defaultStudentData);
  
  const [messReport, setMessReport] = useState({
    breakfast_feedback: 'Okay',
    lunch_feedback: 'Okay',
    dinner_feedback: 'Okay'
  });

  const [committeeVisits, setCommitteeVisits] = useState({
    bh_ii_status: 'Yes',
    omv_status: 'Yes',
    sgn_status: 'Yes',
    jayameena_status: 'Yes',
    remarks: ''
  });

  const [securityRows, setSecurityRows] = useState(defaultSecurityData);
  const [housekeepingRows, setHousekeepingRows] = useState(defaultHousekeepingData);

  const [wardenAttendance, setWardenAttendance] = useState({
    allotted_nos: 6,
    present_count: 4,
    absent_count: 0,
    vacancy_count: 2
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle student row change
  const handleStudentChange = (index, field, value) => {
    const updated = [...studentRows];
    updated[index] = {
      ...updated[index],
      [field]: ['total_admitted', 'students_present', 'absent_with_permission', 'absent_without_permission'].includes(field)
        ? Math.max(0, parseInt(value || 0, 10))
        : value
    };
    setStudentRows(updated);
  };

  // Handle security row change
  const handleSecurityChange = (index, field, value) => {
    const updated = [...securityRows];
    const valNum = Math.max(0, parseInt(value || 0, 10));
    updated[index] = {
      ...updated[index],
      [field]: valNum
    };
    
    // Auto calculate vacancies
    const row = updated[index];
    row.vacancy_day = Math.max(0, row.allotted_nos - (row.present_day + row.absent_day));
    row.vacancy_night = Math.max(0, row.allotted_nos - (row.present_night + row.absent_night));
    
    setSecurityRows(updated);
  };

  // Handle housekeeping row change
  const handleHkChange = (index, field, value) => {
    const updated = [...housekeepingRows];
    const valNum = Math.max(0, parseInt(value || 0, 10));
    updated[index] = {
      ...updated[index],
      [field]: valNum
    };
    const row = updated[index];
    row.vacancy_count = Math.max(0, row.allotted_nos - (row.present_count + row.absent_count));
    setHousekeepingRows(updated);
  };

  // Handle warden attendance change
  const handleWardenAttendanceChange = (field, value) => {
    const valNum = Math.max(0, parseInt(value || 0, 10));
    setWardenAttendance(prev => {
      const updated = { ...prev, [field]: valNum };
      updated.vacancy_count = Math.max(0, updated.allotted_nos - (updated.present_count + updated.absent_count));
      return updated;
    });
  };

  // Grand totals calculation for Students
  const totalAdmittedSum = studentRows.reduce((acc, r) => acc + (r.total_admitted || 0), 0);
  const totalPresentSum = studentRows.reduce((acc, r) => acc + (r.students_present || 0), 0);
  const totalAbsentPermSum = studentRows.reduce((acc, r) => acc + (r.absent_with_permission || 0), 0);
  const totalAbsentUnpermSum = studentRows.reduce((acc, r) => acc + (r.absent_without_permission || 0), 0);

  // Validation
  const validateForm = () => {
    if (!reportDate) {
      setErrorMessage('Mandatory Field Missing: Please select a valid Report Date.');
      return false;
    }
    if (!wardenSignature || wardenSignature.trim() === '') {
      setErrorMessage('Mandatory Field Missing: Warden Signature / Name is required.');
      return false;
    }

    // Check student count validity
    for (let i = 0; i < studentRows.length; i++) {
      const r = studentRows[i];
      const sum = r.students_present + r.absent_with_permission + r.absent_without_permission;
      if (r.total_admitted > 0 && sum !== r.total_admitted) {
        setErrorMessage(
          `Validation Notice: Row ${r.category} (${r.institution_code}) total admitted (${r.total_admitted}) does not equal Present (${r.students_present}) + Absent Perm (${r.absent_with_permission}) + Absent Unperm (${r.absent_without_permission}) = ${sum}. Please double check.`
        );
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        hostel_name: hostelName,
        report_date: reportDate,
        warden_signature_name: wardenSignature,
        dean_approval_remarks: deanRemarks,
        maintenance_work: maintenanceWork,
        student_attendance: studentRows,
        mess_report: messReport,
        committee_visits: committeeVisits,
        security_attendance: securityRows,
        housekeeping_attendance: housekeepingRows,
        warden_attendance: wardenAttendance
      };

      const res = await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessMessage(res.message || 'Daily Hostel Report successfully submitted and saved to PostgreSQL!');
      if (onReportSubmitted) onReportSubmitted(res.id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit daily hostel report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="report-card">
      <div className="report-header-banner">
        <div>
          <h1>DAILY HOSTEL REPORT</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Official Mandatory Daily Attendance & Facilities Log</p>
        </div>

        <div className="report-header-inputs">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="#0284c7" />
            <label className="form-label" style={{ margin: 0 }}>HOSTEL:</label>
            <input
              type="text"
              className="form-control"
              style={{ width: '160px', fontWeight: '600' }}
              value={hostelName}
              onChange={(e) => setHostelName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#0284c7" />
            <label className="form-label" style={{ margin: 0 }}>DATE <span className="required">*</span>:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: '160px', fontWeight: '600' }}
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <div>{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: STUDENTS ATTENDANCE */}
        <div className="section-title">
          <span>1. STUDENTS ATTENDANCE</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>* All numerical fields mandatory</span>
        </div>

        <div className="table-responsive">
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Institution</th>
                <th style={{ width: '10%' }}>Sub-Block</th>
                <th style={{ width: '8%' }}>Total Admitted</th>
                <th style={{ width: '8%' }}>Students Present</th>
                <th style={{ width: '8%' }}>Absent (Perm)</th>
                <th style={{ width: '8%' }}>Absent (Unperm)</th>
                <th style={{ width: '14%' }}>Name of Students Without Perm</th>
                <th style={{ width: '10%' }}>Time Informed</th>
                <th style={{ width: '11%' }}>Parent Contact</th>
                <th style={{ width: '11%' }}>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((row, idx) => {
                const showCategoryHeader = idx === 0 || studentRows[idx - 1].category !== row.category;
                return (
                  <React.Fragment key={idx}>
                    {showCategoryHeader && (
                      <tr>
                        <td colSpan="10" className="cat-header">
                          {row.category}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ fontWeight: '500', paddingLeft: '1rem', color: '#475569' }}>{row.category}</td>
                      <td style={{ fontWeight: '700', textAlign: 'center' }}>{row.institution_code}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={row.total_admitted}
                          onChange={(e) => handleStudentChange(idx, 'total_admitted', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={row.students_present}
                          onChange={(e) => handleStudentChange(idx, 'students_present', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={row.absent_with_permission}
                          onChange={(e) => handleStudentChange(idx, 'absent_with_permission', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={row.absent_without_permission}
                          onChange={(e) => handleStudentChange(idx, 'absent_without_permission', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Student names..."
                          value={row.unpermitted_student_names}
                          onChange={(e) => handleStudentChange(idx, 'unpermitted_student_names', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="e.g. 09:30 PM"
                          value={row.time_informed_parents}
                          onChange={(e) => handleStudentChange(idx, 'time_informed_parents', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Phone No..."
                          value={row.parent_contact_no}
                          onChange={(e) => handleStudentChange(idx, 'parent_contact_no', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Reason..."
                          value={row.remarks}
                          onChange={(e) => handleStudentChange(idx, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              <tr className="total-row">
                <td colSpan="2" style={{ textAlign: 'right', paddingRight: '1rem' }}>
                  GRANT TOTAL:
                </td>
                <td style={{ textAlign: 'center', fontSize: '1rem' }}>{totalAdmittedSum}</td>
                <td style={{ textAlign: 'center', fontSize: '1rem' }}>{totalPresentSum}</td>
                <td style={{ textAlign: 'center', fontSize: '1rem' }}>{totalAbsentPermSum}</td>
                <td style={{ textAlign: 'center', fontSize: '1rem' }}>{totalAbsentUnpermSum}</td>
                <td colSpan="4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2 & 3: MESS REPORT & MAINTENANCE WORK */}
        <div className="form-grid-2">
          <div>
            <div className="section-title">2. MESS REPORT - FACULTY FEEDBACK</div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="form-group">
                <label className="form-label">BREAKFAST FEEDBACK <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={messReport.breakfast_feedback}
                  onChange={(e) => setMessReport({ ...messReport, breakfast_feedback: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">LUNCH FEEDBACK <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={messReport.lunch_feedback}
                  onChange={(e) => setMessReport({ ...messReport, lunch_feedback: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">DINNER FEEDBACK <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={messReport.dinner_feedback}
                  onChange={(e) => setMessReport({ ...messReport, dinner_feedback: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="section-title">3. MAINTENANCE WORK</div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'calc(100% - 3.5rem)' }}>
              <div className="form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <label className="form-label">LONG PENDING AND PRIORITY WORK</label>
                <textarea
                  className="form-control"
                  style={{ flex: 1, minHeight: '120px', resize: 'vertical' }}
                  placeholder="Record maintenance requests, plumbing, electrical, or structural priority tasks..."
                  value={maintenanceWork}
                  onChange={(e) => setMaintenanceWork(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: COMMITTEE VISIT */}
        <div className="section-title">4. COMMITTEE VISIT (Anti-Ragging / Discipline)</div>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div className="form-grid-3" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">BH II Inspection Status:</label>
              <select
                className="form-control"
                value={committeeVisits.bh_ii_status}
                onChange={(e) => setCommitteeVisits({ ...committeeVisits, bh_ii_status: e.target.value })}
              >
                <option value="Yes">Visited / Satisfactory (Yes)</option>
                <option value="No">Not Visited (No)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">OMV Inspection Status:</label>
              <select
                className="form-control"
                value={committeeVisits.omv_status}
                onChange={(e) => setCommitteeVisits({ ...committeeVisits, omv_status: e.target.value })}
              >
                <option value="Yes">Visited / Satisfactory (Yes)</option>
                <option value="No">Not Visited (No)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">SGN Inspection Status:</label>
              <select
                className="form-control"
                value={committeeVisits.sgn_status}
                onChange={(e) => setCommitteeVisits({ ...committeeVisits, sgn_status: e.target.value })}
              >
                <option value="Yes">Visited / Satisfactory (Yes)</option>
                <option value="No">Not Visited (No)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">JAYAMEENA Inspection Status:</label>
              <select
                className="form-control"
                value={committeeVisits.jayameena_status}
                onChange={(e) => setCommitteeVisits({ ...committeeVisits, jayameena_status: e.target.value })}
              >
                <option value="Yes">Visited / Satisfactory (Yes)</option>
                <option value="No">Not Visited (No)</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Committee Remarks:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Additional findings or observations..."
              value={committeeVisits.remarks}
              onChange={(e) => setCommitteeVisits({ ...committeeVisits, remarks: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 5: SECURITY ATTENDANCE */}
        <div className="section-title">5. SECURITY ATTENDANCE</div>
        <div className="table-responsive">
          <table className="report-table">
            <thead>
              <tr>
                <th rowSpan="2" style={{ width: '20%' }}>Designation</th>
                <th rowSpan="2" style={{ width: '12%' }}>Allotted Nos.</th>
                <th colSpan="2">PRESENT</th>
                <th colSpan="2">ABSENT</th>
                <th colSpan="2">VACANCY</th>
              </tr>
              <tr>
                <th style={{ width: '11%' }}>Day Shift</th>
                <th style={{ width: '11%' }}>Night Shift</th>
                <th style={{ width: '11%' }}>Day Shift</th>
                <th style={{ width: '11%' }}>Night Shift</th>
                <th style={{ width: '12%' }}>Day Shift</th>
                <th style={{ width: '12%' }}>Night Shift</th>
              </tr>
            </thead>
            <tbody>
              {securityRows.map((sec, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700' }}>{sec.designation}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input number-input"
                      value={sec.allotted_nos}
                      onChange={(e) => handleSecurityChange(idx, 'allotted_nos', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input number-input"
                      value={sec.present_day}
                      onChange={(e) => handleSecurityChange(idx, 'present_day', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input number-input"
                      value={sec.present_night}
                      onChange={(e) => handleSecurityChange(idx, 'present_night', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input number-input"
                      value={sec.absent_day}
                      onChange={(e) => handleSecurityChange(idx, 'absent_day', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input number-input"
                      value={sec.absent_night}
                      onChange={(e) => handleSecurityChange(idx, 'absent_night', e.target.value)}
                      required
                    />
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: sec.vacancy_day > 0 ? '#dc2626' : '#059669' }}>
                    {sec.vacancy_day}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: sec.vacancy_night > 0 ? '#dc2626' : '#059669' }}>
                    {sec.vacancy_night}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 6 & 7: HOUSEKEEPING & WARDEN ATTENDANCE */}
        <div className="form-grid-2">
          <div>
            <div className="section-title">6. HOUSE KEEPING ATTENDANCE</div>
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Designation</th>
                    <th style={{ width: '18%' }}>Allotted</th>
                    <th style={{ width: '18%' }}>Present</th>
                    <th style={{ width: '15%' }}>Absent</th>
                    <th style={{ width: '14%' }}>Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  {housekeepingRows.map((hk, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '700' }}>{hk.designation}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={hk.allotted_nos}
                          onChange={(e) => handleHkChange(idx, 'allotted_nos', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={hk.present_count}
                          onChange={(e) => handleHkChange(idx, 'present_count', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="table-input number-input"
                          value={hk.absent_count}
                          onChange={(e) => handleHkChange(idx, 'absent_count', e.target.value)}
                          required
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: hk.vacancy_count > 0 ? '#dc2626' : '#059669' }}>
                        {hk.vacancy_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="section-title">7. WARDEN ATTENDANCE</div>
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Staff</th>
                    <th style={{ width: '18%' }}>Allotted</th>
                    <th style={{ width: '18%' }}>Present</th>
                    <th style={{ width: '15%' }}>Absent</th>
                    <th style={{ width: '14%' }}>Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '700' }}>WARDENS</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="table-input number-input"
                        value={wardenAttendance.allotted_nos}
                        onChange={(e) => handleWardenAttendanceChange('allotted_nos', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="table-input number-input"
                        value={wardenAttendance.present_count}
                        onChange={(e) => handleWardenAttendanceChange('present_count', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="table-input number-input"
                        value={wardenAttendance.absent_count}
                        onChange={(e) => handleWardenAttendanceChange('absent_count', e.target.value)}
                        required
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: wardenAttendance.vacancy_count > 0 ? '#dc2626' : '#059669' }}>
                      {wardenAttendance.vacancy_count}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 8: SIGNATURES & SUBMISSION */}
        <div className="section-title">8. AUTHORIZATION & SIGNATURES</div>
        <div className="form-grid-2" style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">
              WARDEN SIGNATURE / NAME <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem', fontWeight: '600' }}
                value={wardenSignature}
                onChange={(e) => setWardenSignature(e.target.value)}
                placeholder="Name of Warden submitting..."
                required
              />
              <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">DEAN (SA) REMARKS / STATUS</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={deanRemarks}
                onChange={(e) => setDeanRemarks(e.target.value)}
                placeholder="Remarks from Dean Student Affairs..."
              />
              <FileText size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setHostelName('BOYS HOSTEL');
              setReportDate(getToday());
              setWardenSignature(user?.fullName || 'M. Vincent Raman');
              setDeanRemarks('');
              setMaintenanceWork('');
              setStudentRows(defaultStudentData);
              setMessReport({
                breakfast_feedback: 'Okay',
                lunch_feedback: 'Okay',
                dinner_feedback: 'Okay'
              });
              setCommitteeVisits({
                bh_ii_status: 'Yes',
                omv_status: 'Yes',
                sgn_status: 'Yes',
                jayameena_status: 'Yes',
                remarks: ''
              });
              setSecurityRows(defaultSecurityData);
              setHousekeepingRows(defaultHousekeepingData);
              setWardenAttendance({
                allotted_nos: 6,
                present_count: 4,
                absent_count: 0,
                vacancy_count: 2
              });
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            <RotateCcw size={16} />
            <span>Reset to Default</span>
          </button>

          <button type="submit" className="btn-primary" style={{ width: 'auto', minWidth: '220px' }} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Submitting & Saving...' : 'Submit Daily Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
