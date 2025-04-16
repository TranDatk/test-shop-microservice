require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const User = require('./models/user.model');
const userRoutes = require('./routes/user.routes');
const messageBroker = require('./utils/message-broker');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const initializeDatabase = async () => {
  try {
    await User.createTable();
    
    // Check if admin user exists
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      await User.createUser({
        user_id: 'admin-user',
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });
      console.log('Admin user created');
    }
    
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

// Connect to message broker
const connectMessageBroker = async () => {
  try {
    await messageBroker.connect();
    
    // Setup message consumers
    await messageBroker.consumeMessage(
      'user_events',
      'user_service_auth_events',
      'user.created',
      async (message) => {
        console.log('Received user created event:', message);
        // Handle user created event if needed
      }
    );
  } catch (err) {
    console.error('Message broker connection failed:', err);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await connectMessageBroker();
    
    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();