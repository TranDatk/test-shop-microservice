require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const proxyRoutes = require('./routes/proxy.routes');
const keycloakRoutes = require('./routes/keycloak.routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Logging middleware để debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Kiểm tra biến môi trường khi khởi động
console.log('Environment variables:');
console.log(`KEYCLOAK_URL: ${process.env.KEYCLOAK_URL}`);
console.log(`KEYCLOAK_REALM: ${process.env.KEYCLOAK_REALM}`);
console.log(`KEYCLOAK_CLIENT_ID: ${process.env.KEYCLOAK_CLIENT_ID}`);
console.log(`KEYCLOAK_CLIENT_SECRET: ${process.env.KEYCLOAK_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);

// Keycloak Auth Routes
app.use('/api/auth', keycloakRoutes);

// Proxy Routes
app.use('/', proxyRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});