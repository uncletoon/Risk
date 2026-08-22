const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const initDb = async () => {
  try {
    console.log('Connecting to PostgreSQL to run schema migrations...');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database tables created successfully.');

    // 1. Seed Users Only
    const passwordHash = await bcrypt.hash('password123', 10);

    const userInserts = [
      {
        name: 'Uncle Admin',
        email: 'admin@sagerganza.rw',
        role: 'admin',
        dept: 'Executive / IT Administration'
      },
      {
        name: 'Bamureke Anne',
        email: 'risk.officer@sagerganza.rw',
        role: 'risk_officer',
        dept: 'Risk & Compliance Department'
      },
      {
        name: 'Jean Claude Mugisha',
        email: 'loan.officer@sagerganza.rw',
        role: 'employee',
        dept: 'Credit Portfolio & Loan Operations'
      }
    ];

    for (const u of userInserts) {
      await pool.query(
        `INSERT INTO users (full_name, email, password, role, department)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
        [u.name, u.email, passwordHash, u.role, u.dept]
      );
    }
    console.log('Users initialized with password: password123');

    // 2. Ensure submission & assessment tables remain clean
    await pool.query(`
      TRUNCATE TABLE risk_assessments CASCADE;
      TRUNCATE TABLE risk_submissions CASCADE;
      TRUNCATE TABLE liquidity_snapshots CASCADE;
    `);

    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database migration error:', err);
    process.exit(1);
  }
};

initDb();