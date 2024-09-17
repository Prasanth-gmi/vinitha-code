const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',  // Allow only your frontend origin
  // origin: 'http://host.docker.internal:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Your routes
app.post('/stakeholder', (req, res) => {
  // Your stakeholder logic
  res.json({ message: "Stakeholder task generated" });
});

app.post('/product_owner', (req, res) => {
  // Your product owner logic
  res.json({ message: "Product Owner task generated" });
});

// Add routes for other agents...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // console.log(`Server running on http://host.docker.internal:${PORT}`)
});