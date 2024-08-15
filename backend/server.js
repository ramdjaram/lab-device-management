const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
    [username, hashedPassword, role]
  );
  res.json(result.rows[0]);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.get('/admin', authenticateJWT, (req, res) => {
  if (req.user.role === 'admin') {
    res.send('Admin content');
  } else {
    res.sendStatus(403);
  }
});

app.get('/user', authenticateJWT, (req, res) => {
  if (req.user.role === 'user') {
    res.send('User content');
  } else {
    res.sendStatus(403);
  }
});

// Device routes
app.post('/devices', authenticateJWT, async (req, res) => {
  const { manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab } = req.body;
  const result = await pool.query(
    'INSERT INTO devices (manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, req.user.id]
  );
  res.json(result.rows[0]);
});

app.get('/devices', authenticateJWT, async (req, res) => {
  const result = await pool.query('SELECT * FROM devices WHERE user_id = $1', [req.user.id]);
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});