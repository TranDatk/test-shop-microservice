require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Product = require('./models/product.model');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Initialize database and sample data
const initializeDatabase = async () => {
  try {
    await Product.createTable();
    await Product.initSampleData();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

// API routes
app.use('/api/products', productRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Product Service API' });
});

// Initialize the database before starting the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
}); 