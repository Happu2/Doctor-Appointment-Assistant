const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection()
  .then(() => console.log('MySQL connected successfully'))
  .catch(err => console.error('MySQL connection error:', err));

async function checkAvailability(doctor, time) {
  return { available: true, slot: time };
}

async function getVisitCount(date) {
  try {
    let queryDate;
    if (date === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      queryDate = yesterday.toISOString().split('T')[0]; // e.g., '2025-06-24'
    } else {
      queryDate = date;
    }
    console.log('getVisitCount querying date:', queryDate);
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_time) = ?', [queryDate]);
    return rows[0].count;
  } catch (err) {
    console.error('getVisitCount error:', err);
    throw err;
  }
}

async function getAppointmentCount(...days) {
  try {
    const queryDays = days.map(day => {
      if (day === 'today') {
        return new Date().toISOString().split('T')[0];
      } else if (day === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      return day;
    });
    console.log('getAppointmentCount querying days:', queryDays);
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_time) IN (?)', [queryDays]);
    return rows[0].count;
  } catch (err) {
    console.error('getAppointmentCount error:', err);
    throw err;
  }
}

async function getConditionCount(condition) {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE `condition` = ?', [condition]);
    return rows[0].count;
  } catch (err) {
    console.error('getConditionCount error:', err);
    throw err;
  }
}

module.exports = { checkAvailability, getVisitCount, getAppointmentCount, getConditionCount };
