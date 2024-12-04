const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// const corsOptions = {
//   origin: 'http://localhost:3000', // Replace with your frontend's domain
//   credentials: true, // Allow cookies to be sent
// };
// const rateLimit = require('express-rate-limit');

// // Rate limiter for login route
// npm install express-rate-limit
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 login requests per windowMs
//   message: 'Too many login attempts from this IP, please try again after 15 minutes',
// });

// // Apply to login route
// app.use('/api/auth/login', loginLimiter);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
// Models
const Class = require("./models/Class");
const Teacher = require("./models/Teacher");
const Student = require("./models/Student");

// CRUD Routes
const crudRouter = require("./routes/crud");
app.use("/api", crudRouter);

const uploadRouter = require("./routes/upload");
app.use("/api/upload", uploadRouter);
app.use("/uploads", express.static("uploads"));

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
