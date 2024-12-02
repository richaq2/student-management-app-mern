const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));
// Models
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

// CRUD Routes
const crudRouter = require('./routes/crud');
app.use('/api', crudRouter);

const profileRouter = require('./routes/profile');
app.use('/api/profile', profileRouter);

const uploadRouter = require('./routes/upload');
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static('uploads'));

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
