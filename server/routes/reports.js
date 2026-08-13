const express = require('express');
const router = express.Router();
const { pool, isPostgresConnected, fallbackData, saveFallback } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/reports - Create new report
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      hostel_name,
      report_date,
      warden_signature_name,
      dean_approval_remarks,
      maintenance_work,
      student_attendance,
      mess_report,
      committee_visits,
      security_attendance,
      housekeeping_attendance,
      warden_attendance
    } = req.body;

    // Validation
    if (!report_date) {
      return res.status(400).json({ error: 'Report Date is mandatory.' });
    }
    if (!warden_signature_name || warden_signature_name.trim() === '') {
      return res.status(400).json({ error: 'Warden Signature / Name is mandatory.' });
    }
    if (!student_attendance || !Array.isArray(student_attendance) || student_attendance.length === 0) {
      return res.status(400).json({ error: 'Student attendance records are mandatory.' });
    }

    if (isPostgresConnected()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert Master Daily Report
        const masterRes = await client.query(
          `INSERT INTO daily_reports 
           (hostel_name, report_date, warden_signature_name, dean_approval_remarks, maintenance_work, created_by)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            hostel_name || 'BOYS HOSTEL',
            report_date,
            warden_signature_name.trim(),
            dean_approval_remarks || '',
            maintenance_work || '',
            req.user.id
          ]
        );

        const reportId = masterRes.rows[0].id;

        // Insert Student Attendance
        for (const item of student_attendance) {
          await client.query(
            `INSERT INTO student_attendance 
             (report_id, category, institution_code, total_admitted, students_present, absent_with_permission, absent_without_permission, unpermitted_student_names, time_informed_parents, parent_contact_no, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              reportId,
              item.category || '',
              item.institution_code || '',
              parseInt(item.total_admitted || 0, 10),
              parseInt(item.students_present || 0, 10),
              parseInt(item.absent_with_permission || 0, 10),
              parseInt(item.absent_without_permission || 0, 10),
              item.unpermitted_student_names || '',
              item.time_informed_parents || '',
              item.parent_contact_no || '',
              item.remarks || ''
            ]
          );
        }

        // Insert Mess Report
        if (mess_report) {
          await client.query(
            `INSERT INTO mess_report (report_id, breakfast_feedback, lunch_feedback, dinner_feedback)
             VALUES ($1, $2, $3, $4)`,
            [
              reportId,
              mess_report.breakfast_feedback || 'Okay',
              mess_report.lunch_feedback || 'Okay',
              mess_report.dinner_feedback || 'Okay'
            ]
          );
        }

        // Insert Committee Visits
        if (committee_visits) {
          await client.query(
            `INSERT INTO committee_visits (report_id, bh_ii_status, omv_status, sgn_status, jayameena_status, remarks)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              reportId,
              committee_visits.bh_ii_status || 'Yes',
              committee_visits.omv_status || 'Yes',
              committee_visits.sgn_status || 'Yes',
              committee_visits.jayameena_status || 'Yes',
              committee_visits.remarks || ''
            ]
          );
        }

        // Insert Security Attendance
        if (security_attendance && Array.isArray(security_attendance)) {
          for (const sec of security_attendance) {
            await client.query(
              `INSERT INTO security_attendance (report_id, designation, allotted_nos, present_day, present_night, absent_day, absent_night, vacancy_day, vacancy_night)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                reportId,
                sec.designation,
                parseInt(sec.allotted_nos || 0, 10),
                parseInt(sec.present_day || 0, 10),
                parseInt(sec.present_night || 0, 10),
                parseInt(sec.absent_day || 0, 10),
                parseInt(sec.absent_night || 0, 10),
                parseInt(sec.vacancy_day || 0, 10),
                parseInt(sec.vacancy_night || 0, 10)
              ]
            );
          }
        }

        // Insert Housekeeping Attendance
        if (housekeeping_attendance && Array.isArray(housekeeping_attendance)) {
          for (const hk of housekeeping_attendance) {
            await client.query(
              `INSERT INTO housekeeping_attendance (report_id, designation, allotted_nos, present_count, absent_count, vacancy_count)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                reportId,
                hk.designation,
                parseInt(hk.allotted_nos || 0, 10),
                parseInt(hk.present_count || 0, 10),
                parseInt(hk.absent_count || 0, 10),
                parseInt(hk.vacancy_count || 0, 10)
              ]
            );
          }
        }

        // Insert Warden Attendance
        if (warden_attendance) {
          await client.query(
            `INSERT INTO warden_attendance (report_id, allotted_nos, present_count, absent_count, vacancy_count)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              reportId,
              parseInt(warden_attendance.allotted_nos || 0, 10),
              parseInt(warden_attendance.present_count || 0, 10),
              parseInt(warden_attendance.absent_count || 0, 10),
              parseInt(warden_attendance.vacancy_count || 0, 10)
            ]
          );
        }

        await client.query('COMMIT');
        client.release();

        return res.status(201).json({
          message: 'Daily Hostel Report successfully created & stored in PostgreSQL!',
          id: reportId
        });
      } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        throw err;
      }
    } else {
      // Fallback local storage
      const newReportId = fallbackData.reports.length > 0
        ? Math.max(...fallbackData.reports.map(r => r.id)) + 1
        : 1;

      const record = {
        id: newReportId,
        hostel_name: hostel_name || 'BOYS HOSTEL',
        report_date,
        warden_signature_name: warden_signature_name.trim(),
        dean_approval_remarks: dean_approval_remarks || '',
        maintenance_work: maintenance_work || '',
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        student_attendance: student_attendance || [],
        mess_report: mess_report || { breakfast_feedback: 'Okay', lunch_feedback: 'Okay', dinner_feedback: 'Okay' },
        committee_visits: committee_visits || { bh_ii_status: 'Yes', omv_status: 'Yes', sgn_status: 'Yes', jayameena_status: 'Yes', remarks: '' },
        security_attendance: security_attendance || [],
        housekeeping_attendance: housekeeping_attendance || [],
        warden_attendance: warden_attendance || { allotted_nos: 6, present_count: 4, absent_count: 0, vacancy_count: 2 }
      };

      fallbackData.reports.unshift(record);
      saveFallback();

      return res.status(201).json({
        message: 'Daily Hostel Report successfully saved!',
        id: newReportId
      });
    }
  } catch (err) {
    console.error('Create report error:', err);
    return res.status(500).json({ error: 'Failed to save daily report. ' + err.message });
  }
});

// GET /api/reports - List all reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (isPostgresConnected()) {
      const result = await pool.query(
        `SELECT id, hostel_name, report_date, warden_signature_name, created_at 
         FROM daily_reports ORDER BY report_date DESC, created_at DESC`
      );
      return res.json({ reports: result.rows });
    } else {
      const summaries = fallbackData.reports.map(r => ({
        id: r.id,
        hostel_name: r.hostel_name,
        report_date: r.report_date,
        warden_signature_name: r.warden_signature_name,
        created_at: r.created_at
      }));
      return res.json({ reports: summaries });
    }
  } catch (err) {
    console.error('Get reports list error:', err);
    return res.status(500).json({ error: 'Failed to fetch reports list.' });
  }
});

// GET /api/reports/:id - Fetch full details of single report
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);

    if (isPostgresConnected()) {
      const masterRes = await pool.query('SELECT * FROM daily_reports WHERE id = $1', [reportId]);
      if (masterRes.rows.length === 0) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      const master = masterRes.rows[0];

      const studentRes = await pool.query('SELECT * FROM student_attendance WHERE report_id = $1 ORDER BY id ASC', [reportId]);
      const messRes = await pool.query('SELECT * FROM mess_report WHERE report_id = $1', [reportId]);
      const committeeRes = await pool.query('SELECT * FROM committee_visits WHERE report_id = $1', [reportId]);
      const securityRes = await pool.query('SELECT * FROM security_attendance WHERE report_id = $1 ORDER BY id ASC', [reportId]);
      const housekeepingRes = await pool.query('SELECT * FROM housekeeping_attendance WHERE report_id = $1 ORDER BY id ASC', [reportId]);
      const wardenRes = await pool.query('SELECT * FROM warden_attendance WHERE report_id = $1', [reportId]);

      const fullReport = {
        ...master,
        student_attendance: studentRes.rows,
        mess_report: messRes.rows[0] || {},
        committee_visits: committeeRes.rows[0] || {},
        security_attendance: securityRes.rows,
        housekeeping_attendance: housekeepingRes.rows,
        warden_attendance: wardenRes.rows[0] || {}
      };

      return res.json({ report: fullReport });
    } else {
      const found = fallbackData.reports.find(r => r.id === reportId);
      if (!found) {
        return res.status(404).json({ error: 'Report not found.' });
      }
      return res.json({ report: found });
    }
  } catch (err) {
    console.error('Get single report error:', err);
    return res.status(500).json({ error: 'Failed to fetch report details.' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (isPostgresConnected()) {
      await pool.query('DELETE FROM daily_reports WHERE id = $1', [reportId]);
    } else {
      fallbackData.reports = fallbackData.reports.filter(r => r.id !== reportId);
      saveFallback();
    }
    return res.json({ message: 'Report deleted successfully.' });
  } catch (err) {
    console.error('Delete report error:', err);
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
});

module.exports = router;
