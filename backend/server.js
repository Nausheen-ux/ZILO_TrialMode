const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const trialRoutes = require('./routes/trial');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/trial', trialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ZILO Trial Mode API running' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));