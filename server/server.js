const express = require('express')
const cors = require('cors')
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const connectDB = require("./config/db")

const app = express()
const port = process.env.PORT || 5000

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Routes
app.use('/api/auth',authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('API is running...')
})

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler (optional but professional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})