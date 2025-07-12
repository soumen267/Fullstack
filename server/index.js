const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const isProduction = process.env.NODE_ENV === 'production';
// Ensure .env loads from /server/.env
require('dotenv').config({ path: '../.env' });

// Handle warning: Max listeners exceeded
require('events').EventEmitter.defaultMaxListeners = 20;

const app = express();
const PORT = 5000;

// ---------------------------------------
// 🔐 Middleware
// ---------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS setup: allow localhost + Ngrok access
const allowedOrigins = [
  process.env.CORS_ORIGIN_DEV,
  process.env.CORS_ORIGIN_PROD
].filter(Boolean);

app.use(cors({
  origin: isProduction ? function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error('❌ Blocked by CORS:', origin);
          callback(new Error('CORS policy: Not allowed by CORS'));
        }
      }
    : true, // In development, allow all
  credentials: true
}));


// ---------------------------------------
// 🛢️ Connect MongoDB
// ---------------------------------------
const DB = process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
if (DB) {
  mongoose.connect(DB)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ DATABASE or DATABASE_PASSWORD not set in .env');
}

// ✅ Root test endpoint for Ngrok
app.get('/', (req, res) => {
  res.send('✅ Ngrok is working and server is running!');
});

// ---------------------------------------
// 📦 Routes
// ---------------------------------------
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/orderRoutes'));
app.use('/', require('./routes/uploadRoutes'));
app.use('/', require('./routes/wishlist'));
app.use('/', require('./routes/emailRouter'));
app.use('/', require('./routes/paypalRouter'));
app.use('/', require('./routes/StripeGooglePayRoutes'));
app.use('/', require('./routes/stripeRoute'));

// ---------------------------------------
// 🚀 Start Server
// ---------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((req, res) => {
  res.status(404).send('❌ Not Found');
});