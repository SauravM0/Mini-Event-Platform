const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Check for critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
const clientUrl = (process.env.CLIENT_URL || '*').replace(/\/$/, "");
app.use(cors({
  origin: clientUrl,
  credentials: true
}));

// Basic Logger (Dev only)
const fs = require('fs');
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Global Error Logger for debugging
const originalConsoleError = console.error;
console.error = function (...args) {
  fs.appendFileSync('server_error.log', new Date().toISOString() + ' ' + args.map(a => (a && a.stack) ? a.stack : JSON.stringify(a)).join(' ') + '\n');
  originalConsoleError.apply(console, args);
};

const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
