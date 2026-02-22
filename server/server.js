const express = require('express')
const cors = require('cors')
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const connectDB = require("./config/db")
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use("/api/tasks", taskRoutes);

connectDB();
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})