const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Cannot find user');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Not Allowed');

    const token = jwt.sign({ _id: user._id, username: user.name }, 'your_secret_key', { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 86400000
    });

    res.json({ username: user.name });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false
  });
  res.sendStatus(200);
});

// Auth status check
router.get('/auth-status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    res.json({ isAuthenticated: true, username: decoded.username || 'User', userId: decoded._id });
  } catch (err) {
    return res.json({ isAuthenticated: false });
  }
});

module.exports = router;