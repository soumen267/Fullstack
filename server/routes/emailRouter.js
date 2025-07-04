const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Send confirmation email
router.post('/send-confirmation', async (req, res) => {
  const { email, username } = req.body;

  const templatePath = path.join(__dirname, '..', 'templates', 'confirmation.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf-8');
  const confirmLink = `http://localhost:3000/confirm?email=${encodeURIComponent(email)}`;

  htmlContent = htmlContent
    .replace('{{username}}', username)
    .replace('{{confirmLink}}', confirmLink);

  try {
    await transporter.sendMail({
      from: '"MyApp" <no-reply@myapp.com>',
      to: email,
      subject: 'Confirm your account',
      html: htmlContent,
    });

    res.json({ success: true, message: 'Confirmation email sent.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

module.exports = router;