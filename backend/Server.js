const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
const moment = require('moment-timezone');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const generateToken = (user) => {
	return jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
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
	const {username, password} = req.body;
	const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
	if (result.rows.length === 0) return res.sendStatus(401);

	const user = result.rows[0];
	if (await bcrypt.compare(password, user.password)) {
		const token = generateToken(user);
		res.json({token});
	} else {
		res.sendStatus(401);
	}
});

app.post('/register', async (req, res) => {
	const {username, password, role} = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	const result = await pool.query(
		'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
		[username, hashedPassword, role]
	);
	res.json(result.rows[0]);
});

app.get('/user', authenticateToken, async (req, res) => {
	const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
	if (result.rows.length === 0) return res.sendStatus(404);
	res.json(result.rows[0]);
});

app.get('/admin', authenticateToken, async (req, res) => {
	if (req.user.role !== 'admin') return res.sendStatus(403);
	const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
	if (result.rows.length === 0) return res.sendStatus(404);
	res.json(result.rows[0]);
});

// Fetch all users for the dropdown
app.get('/users', authenticateToken, async (req, res) => {
	const result = await pool.query('SELECT id, username FROM users');
	res.json(result.rows);
});

app.get('/devices', authenticateToken, async (req, res) => {
	const {barcode, model, reservation} = req.query;
	let query = 'SELECT * FROM devices';
	const params = [];

	if (barcode) {
		query += ' WHERE barcode = $1';
		params.push(barcode);
	}
	if (model) {
		query += params.length ? ' AND model = $2' : ' WHERE model = $1';
		params.push(model);
	}
	if (reservation) {
		query += params.length ? ' AND reservation = $3' : ' WHERE reservation = $1';
		params.push(reservation);
	}

	query += ' ORDER BY reservation_date DESC';

	const result = await pool.query(query, params);
	res.json(result.rows);
});

app.post('/devices', authenticateToken, async (req, res) => {
	const {
		manufacturer = '',
		model,
		internal_name = '',
		pid = '',
		barcode,
		ip_address = '',
		reservation,
		location = 'BgLab',
		reservation_date = '1970-01-01',
		present_in_lab = true,
		status = ''
	} = req.body;

	// Validation for mandatory fields
	if (!model || !barcode || !reservation) {
		return res.status(400).json({message: 'Model, Barcode, and Reservation are required fields.'});
	}

	const result = await pool.query(
		'INSERT INTO devices (manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
		[manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, reservation_date, present_in_lab, status, req.user.id]
	);
	res.json(result.rows[0]);
});

app.put('/devices/:id', authenticateToken, async (req, res) => {
	const {id} = req.params;
	const {
		manufacturer,
		model,
		internal_name,
		pid,
		barcode,
		ip_address,
		reservation,
		location,
		present_in_lab,
		status
	} = req.body;

	const result = await pool.query(
		`UPDATE devices
         SET manufacturer   = COALESCE($1, manufacturer),
             model          = COALESCE($2, model),
             internal_name  = COALESCE($3, internal_name),
             pid            = COALESCE($4, pid),
             barcode        = COALESCE($5, barcode),
             ip_address     = COALESCE($6, ip_address),
             reservation    = COALESCE($7, reservation),
             location       = COALESCE($8, location),
             present_in_lab = COALESCE($9, present_in_lab),
             status         = COALESCE($10, status)
         WHERE id = $11 RETURNING *`,
		[manufacturer, model, internal_name, pid, barcode, ip_address, reservation, location, present_in_lab, status, id]
	);

	if (result.rows.length === 0) {
		return res.sendStatus(404);
	}
	res.json(result.rows[0]);
});

// Update reservation endpoint to set reservation_date
app.put('/devices/:id/reserve', authenticateToken, async (req, res) => {
	const {id} = req.params;
	const {reservation} = req.body;
	const result = await pool.query(
		'UPDATE devices SET reservation = $1, reservation_date = NOW() WHERE id = $2 RETURNING *',
		[reservation, id]
	);
	const updatedDevice = result.rows[0];
	updatedDevice.reservation_date = moment(updatedDevice.reservation_date).tz('Europe/Berlin').format('DD-MM-YYYY HH:mm:ss');
	res.json(updatedDevice);
});

// Mass delete devices
app.post('/devices/mass-delete', authenticateToken, async (req, res) => {
	const {ids} = req.body;
	await pool.query('DELETE FROM devices WHERE id = ANY($1)', [ids]);
	res.sendStatus(204);
});

app.delete('/devices/:id', authenticateToken, async (req, res) => {
	const {id} = req.params;
	const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING *', [id]);
	if (result.rowCount === 0) {
		return res.sendStatus(404);
	}
	res.sendStatus(204);
});

// not used
// Bulk update devices
app.put('/devices/bulk-update', authenticateToken, async (req, res) => {
	const updates = req.body.updates;

	try {
		const updatePromises = updates.map(({id, updatedDevice}) =>
			pool.query(
				`UPDATE devices
                 SET manufacturer   = COALESCE($1, manufacturer),
                     model          = COALESCE($2, model),
                     internal_name  = COALESCE($3, internal_name),
                     pid            = COALESCE($4, pid),
                     barcode        = COALESCE($5, barcode),
                     ip_address     = COALESCE($6, ip_address),
                     reservation    = COALESCE($7, reservation),
                     location       = COALESCE($8, location),
                     present_in_lab = COALESCE($9, present_in_lab)
                 WHERE id = $10 RETURNING *`,
				[
					updatedDevice.manufacturer,
					updatedDevice.model,
					updatedDevice.internal_name,
					updatedDevice.pid,
					updatedDevice.barcode,
					updatedDevice.ip_address,
					updatedDevice.reservation,
					updatedDevice.location,
					updatedDevice.present_in_lab,
					id
				]
			)
		);

		await Promise.all(updatePromises);
		res.status(200).json({message: 'Devices updated successfully'});
	} catch (error) {
		res.status(500).json({message: 'Failed to update devices', error});
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});