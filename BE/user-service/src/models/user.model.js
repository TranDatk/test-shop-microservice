const db = require('../config/db.config');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.query(query);
      console.log('Users table created or already exists');
    } catch (err) {
      console.error('Error creating users table:', err);
      throw err;
    }
  }

  static async findById(userId) {
    const query = `
      SELECT * FROM users
      WHERE user_id = $1
    `;
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }

  static async findByEmail(email) {
    const query = `
      SELECT * FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  static async findAllUsers() {
    const query = `
      SELECT * FROM users
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      console.error('Error finding all users:', err);
      throw err;
    }
  }

  static async createUser(userData) {
    const { user_id, email, first_name, last_name, role = 'user', phone = null, address = null } = userData;
    
    const query = `
      INSERT INTO users (user_id, email, first_name, last_name, role, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [
        user_id,
        email,
        first_name,
        last_name,
        role,
        phone,
        address
      ]);
      
      return result.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async updateUser(userId, userData) {
    const { first_name, last_name, role, phone, address } = userData;
    
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    const params = [];
    
    if (first_name !== undefined) {
      values.push(first_name);
      params.push(`first_name = $${values.length}`);
    }
    
    if (last_name !== undefined) {
      values.push(last_name);
      params.push(`last_name = $${values.length}`);
    }
    
    if (role !== undefined) {
      values.push(role);
      params.push(`role = $${values.length}`);
    }
    
    if (phone !== undefined) {
      values.push(phone);
      params.push(`phone = $${values.length}`);
    }
    
    if (address !== undefined) {
      values.push(address);
      params.push(`address = $${values.length}`);
    }
    
    if (params.length === 0) {
      throw new Error('No fields to update');
    }
    
    query += `, ${params.join(', ')}`;
    query += ` WHERE user_id = $${values.length + 1} RETURNING *`;
    values.push(userId);
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  static async deleteUser(userId) {
    const query = `
      DELETE FROM users
      WHERE user_id = $1
    `;
    
    try {
      await db.query(query, [userId]);
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }
}

module.exports = User;