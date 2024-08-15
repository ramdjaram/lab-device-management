const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) return res.sendStatus(401);

  const user = result.rows[0];
  if (await bcrypt.compare(password, user.password)) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, role]
  );
  res.json(result.rows[0]);
});

app.get('/user', authenticateToken, (req, res) => {
  res.send('User content');
});

app.get('/admin', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  res.send('Admin content');
});

// Device routes
app.post('/devices', authenticateToken, async (req, res) => {
  const { manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab } = req.body;
  const result = await pool.query(
      'INSERT INTO devices (manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, req.user.id]
  );
  res.json(result.rows[0]);
});

app.get('/devices', authenticateToken, async (req, res) => {
  const { barcode, model, reservation } = req.query;
  let query = 'SELECT * FROM devices WHERE user_id = $1';
  const params = [req.user.id];

  if (barcode) {
    query += ' AND barcode = $2';
    params.push(barcode);
  }
  if (model) {
    query += ' AND model = $3';
    params.push(model);
  }
  if (reservation) {
    query += ' AND reservation = $4';
    params.push(reservation);
  }

  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.put('/devices/:id/reserve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
      'UPDATE devices SET reservation = $1, reservation_date = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [req.user.username, id, req.user.id]
  );
  res.json(result.rows[0]);
});

app.delete('/devices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});