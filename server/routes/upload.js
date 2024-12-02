const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Storage Configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// File Upload Route
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

module.exports = router;
