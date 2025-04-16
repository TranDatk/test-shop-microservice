require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'order-service' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Order Service API' });
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
}); 