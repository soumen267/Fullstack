const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('events').EventEmitter.defaultMaxListeners = 20;
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect DB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log('DB connected'));

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/orderRoutes'));
app.use('/', require('./routes/uploadRoutes'));
app.use('/', require('./routes/wishlist'));
app.use('/', require('./routes/emailRouter'));
app.use('/', require('./routes/paypalRouter'));
app.use('/', require('./routes/braintreeRoutes'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});