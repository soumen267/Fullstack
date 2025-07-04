const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { name }] });
    if (existing) return res.status(409).json({ message: 'Email or name already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit user
router.put('/edit/:id', [/* your validations here */], async (req, res) => {
  // use your existing update logic
});

// Get user
router.get('/user/:id', async (req, res) => {
  // your existing findById logic
});

// Delete user
router.delete('/delete/:id', async (req, res) => {
  // your delete logic
});

module.exports = router;