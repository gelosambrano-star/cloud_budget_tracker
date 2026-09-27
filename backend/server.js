const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas Cloud Clusters
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Cloud/local Ledger Connected Successfully.'))
  .catch(err => console.error('Database Connection Error:', err));

// Register Secure API Endpoints
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/auth', require('./routes/auth'));

// Single Production Port Listener Gateway at the very end
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server humming smoothly on port ${PORT}`);
});
