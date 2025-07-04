const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/upload', upload.single('avatar'), (req, res) => {
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;