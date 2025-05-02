require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Akash@2005',
  database: process.env.DB_NAME || 'organ_donation'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// JWT middleware with enhanced logging
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.error('No Authorization header provided');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error('Invalid Authorization header format');
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];
  if (!token) {
    console.error('No token provided after Bearer');
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ 
        message: 'Token verification failed',
        error: err.message 
      });
    }
    
    console.log('Authenticated User:', user);
    req.user = user;
    next();
  });
};

// Routes

// Get all organs (public)
app.get('/api/organs', async (req, res) => {
  try {
    const [organs] = await db.promise().query('SELECT * FROM organs');
    res.json(organs);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, contact_number, address, blood_type } = req.body;
  
  try {
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role, contact_number, address, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, contact_number, address, blood_type]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact_number: user.contact_number,
        blood_type: user.blood_type
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected test route
app.get('/api/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Donation endpoints
app.post('/api/donations', authenticateJWT, async (req, res) => {
  const { organ_id, donation_date } = req.body;
  const donor_id = req.user.id;
  
  try {
    const [result] = await db.promise().query(
      'INSERT INTO donations (donor_id, organ_id, donation_date) VALUES (?, ?, ?)',
      [donor_id, organ_id, donation_date]
    );
    
    res.status(201).json({ 
      message: 'Donation created successfully', 
      donation_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/my-donations', authenticateJWT, async (req, res) => {
  const donor_id = req.user.id;
  
  try {
    const [donations] = await db.promise().query(`
      SELECT d.*, o.name as organ_name, o.description as organ_description 
      FROM donations d
      JOIN organs o ON d.organ_id = o.id
      WHERE d.donor_id = ?
    `, [donor_id]);
    
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request endpoints
app.post('/api/requests', authenticateJWT, async (req, res) => {
  const { organ_id, urgency_level } = req.body;
  const recipient_id = req.user.id;
  
  try {
    const [result] = await db.promise().query(
      'INSERT INTO requests (recipient_id, organ_id, urgency_level) VALUES (?, ?, ?)',
      [recipient_id, organ_id, urgency_level]
    );
    
    res.status(201).json({ 
      message: 'Request created successfully', 
      request_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/my-requests', authenticateJWT, async (req, res) => {
  const recipient_id = req.user.id;
  
  try {
    const [requests] = await db.promise().query(`
      SELECT r.*, o.name as organ_name, o.description as organ_description 
      FROM requests r
      JOIN organs o ON r.organ_id = o.id
      WHERE r.recipient_id = ?
    `, [recipient_id]);
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin/Hospital endpoints
app.get('/api/all-donations', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    const [donations] = await db.promise().query(`
      SELECT d.*, o.name as organ_name, u.name as donor_name, u.blood_type
      FROM donations d
      JOIN organs o ON d.organ_id = o.id
      JOIN users u ON d.donor_id = u.id
      WHERE d.status = 'pending'
    `);
    
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/all-requests', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    const [requests] = await db.promise().query(`
      SELECT r.*, o.name as organ_name, u.name as recipient_name, u.blood_type
      FROM requests r
      JOIN organs o ON r.organ_id = o.id
      JOIN users u ON r.recipient_id = u.id
      WHERE r.status = 'pending'
    `);
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/donations/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const { status, hospital_id } = req.body;
  const donationId = req.params.id;
  
  try {
    await db.promise().query(
      'UPDATE donations SET status = ?, hospital_id = ? WHERE id = ?',
      [status, req.user.role === 'hospital' ? req.user.id : hospital_id, donationId]
    );
    
    res.json({ message: 'Donation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/requests/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const { status, hospital_id } = req.body;
  const requestId = req.params.id;
  
  try {
    await db.promise().query(
      'UPDATE requests SET status = ?, hospital_id = ? WHERE id = ?',
      [status, req.user.role === 'hospital' ? req.user.id : hospital_id, requestId]
    );
    
    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/match', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const { donation_id, request_id } = req.body;
  
  try {
    await db.promise().query('START TRANSACTION');
    
    await db.promise().query(
      'UPDATE donations SET status = "approved", hospital_id = ? WHERE id = ?',
      [req.user.id, donation_id]
    );
    
    await db.promise().query(
      'UPDATE requests SET status = "matched", hospital_id = ? WHERE id = ?',
      [req.user.id, request_id]
    );
    
    await db.promise().query('COMMIT');
    res.json({ message: 'Matching successful' });
  } catch (error) {
    await db.promise().query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    const [users] = await db.promise().query('SELECT id, name, email, role, contact_number, blood_type FROM users');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const userId = req.params.id;
  const { name, email, role, contact_number, address, blood_type } = req.body;
  
  try {
    await db.promise().query(
      'UPDATE users SET name = ?, email = ?, role = ?, contact_number = ?, address = ?, blood_type = ? WHERE id = ?',
      [name, email, role, contact_number, address, blood_type, userId]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const userId = req.params.id;
  
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics (admin/hospital)
app.get('/api/statistics', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hospital') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    // Get counts for different statuses
    const [donationCounts] = await db.promise().query(`
      SELECT status, COUNT(*) as count 
      FROM donations 
      GROUP BY status
    `);
    
    const [requestCounts] = await db.promise().query(`
      SELECT status, COUNT(*) as count 
      FROM requests 
      GROUP BY status
    `);
    
    res.json({
      donationCounts,
      requestCounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
