const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL connection setup
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'shopdb',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Sample product data
const sampleProducts = [
  {
    id: 'product-1',
    name: 'Smartphone XYZ',
    description: 'A powerful smartphone with advanced features',
    price: 999.99,
    stock: 50,
    category: 'electronics',
    image_url: 'https://via.placeholder.com/300',
  },
  {
    id: 'product-2',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    stock: 25,
    category: 'electronics',
    image_url: 'https://via.placeholder.com/300',
  },
  {
    id: 'product-3',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 199.99,
    stock: 100,
    category: 'audio',
    image_url: 'https://via.placeholder.com/300',
  }
];

// Product model
const Product = {
  // Create products table if it doesn't exist
  async createTable() {
    const categoriesTableQuery = `
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const productsTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(50) REFERENCES categories(id),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(categoriesTableQuery);
      await pool.query(productsTableQuery);
      return true;
    } catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  },
  
  // Initialize sample data
  async initSampleData() {
    try {
      // First check if we already have products
      const existingProducts = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(existingProducts.rows[0].count) > 0) {
        return true;
      }
      
      // Insert default categories
      await pool.query(`
        INSERT INTO categories (id, name, description) VALUES 
        ('electronics', 'Electronics', 'Electronic devices and gadgets'),
        ('audio', 'Audio', 'Audio equipment and accessories')
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Insert sample products
      for (const product of sampleProducts) {
        await pool.query(`
          INSERT INTO products (id, name, description, price, stock, category, image_url) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          product.id,
          product.name,
          product.description,
          product.price,
          product.stock,
          product.category,
          product.image_url
        ]);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing sample data:', error);
      return false;
    }
  },
  
  // Find all products
  async findAll() {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category = c.id
      `);
      return result.rows;
    } catch (error) {
      console.error('Error finding all products:', error);
      throw error;
    }
  },
  
  // Find product by id
  async findById(id) {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category = c.id
        WHERE p.id = $1
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error finding product with id ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new product
  async create(productData) {
    const id = productData.id || `product-${uuidv4().substring(0, 8)}`;
    const { name, description, price, stock, category, image_url } = productData;
    
    try {
      const result = await pool.query(`
        INSERT INTO products (id, name, description, price, stock, category, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [id, name, description, price, stock, category, image_url]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update a product
  async update(id, productData) {
    const { name, description, price, stock, category, image_url } = productData;
    
    try {
      const result = await pool.query(`
        UPDATE products
        SET name = $1, description = $2, price = $3, stock = $4, 
            category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [name, description, price, stock, category, image_url, id]);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a product
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  }
};

module.exports = Product; 