const User = require('../models/user.model');
const { getServiceToken } = require('../middlewares/auth.middleware');
const axios = require('axios');
const messageBroker = require('../utils/message-broker');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { user_id, email, first_name, last_name, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findById(user_id);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const newUser = await User.createUser({
      user_id,
      email,
      first_name,
      last_name,
      role
    });
    
    // Sync with Keycloak
    const serviceToken = await getServiceToken();
    
    // Find user in Keycloak
    try {
      const keycloakUsersResponse = await axios.get(
        `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`
          }
        }
      );
      
      if (keycloakUsersResponse.data.length === 0) {
        // User does not exist in Keycloak, create new
        await axios.post(
          `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
          {
            email,
            username: email,
            firstName: first_name,
            lastName: last_name,
            enabled: true
          },
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('Error syncing with Keycloak:', error.message);
      // Continue processing, do not stop
    }
    
    // Publish user created event
    await messageBroker.publishMessage(
      'user_events',
      'user.created',
      {
        user_id,
        email,
        first_name,
        last_name,
        role
      }
    );
    
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error in get all users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error in get user by id:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is updating their own profile or is an admin
    if (req.user.role !== 'admin' && req.user.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update user
    const updatedUser = await User.updateUser(userId, {
      first_name,
      last_name
    });
    
    // Sync with Keycloak
    try {
      const serviceToken = await getServiceToken();
      
      // Find user in Keycloak by email
      const keycloakUsersResponse = await axios.get(
        `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${existingUser.email}`,
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`
          }
        }
      );
      
      if (keycloakUsersResponse.data.length > 0) {
        const keycloakUserId = keycloakUsersResponse.data[0].id;
        
        // Update user information in Keycloak
        await axios.put(
          `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}`,
          {
            firstName: first_name,
            lastName: last_name
          },
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('Error syncing with Keycloak:', error.message);
      // Continue processing, do not stop
    }
    
    // Publish user updated event
    await messageBroker.publishMessage(
      'user_events',
      'user.updated',
      {
        user_id: userId,
        first_name,
        last_name
      }
    );
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error in update user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await User.deleteUser(userId);
    
    // Sync with Keycloak
    try {
      const serviceToken = await getServiceToken();
      
      // Find user in Keycloak by email
      const keycloakUsersResponse = await axios.get(
        `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${existingUser.email}`,
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`
          }
        }
      );
      
      if (keycloakUsersResponse.data.length > 0) {
        const keycloakUserId = keycloakUsersResponse.data[0].id;
        
        // Disable user in Keycloak (do not delete completely)
        await axios.put(
          `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}`,
          {
            enabled: false
          },
          {
            headers: {
              Authorization: `Bearer ${serviceToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('Error syncing with Keycloak:', error.message);
      // Continue processing, do not stop
    }
    
    // Publish user deleted event
    await messageBroker.publishMessage(
      'user_events',
      'user.deleted',
      {
        user_id: userId
      }
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in delete user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only return non-sensitive information
    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (err) {
    console.error('Error in get user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { first_name, last_name, phone, address } = req.body;
    
    // Check if user exists
    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    const updatedUser = await User.updateUser(userId, {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      role: user.role, // Don't allow users to change their own role
      phone: phone || user.phone,
      address: address || user.address
    });
    
    // Publish user updated event
    await messageBroker.publishMessage(
      'user_events',
      'user.updated',
      {
        user_id: userId,
        email: user.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role
      }
    );
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};