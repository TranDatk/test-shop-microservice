require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cart-service' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Cart Service API' });
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
}); 