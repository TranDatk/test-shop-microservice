// Mock database for development
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Cart {
  userId: string;
  items: CartItem[];
}

interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Mock users
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
];

// Mock products
export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    price: 199.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 15,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Latest model with health tracking features',
    price: 249.99,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 10,
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    description: 'Water-resistant backpack with USB charging port',
    price: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=500&h=500&fit=crop',
    category: 'Accessories',
    stock: 25,
  },
  {
    id: '4',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1570354845465-ec01e8f3336a?w=500&h=500&fit=crop',
    category: 'Home',
    stock: 8,
  },
];

// Mock carts
export const carts: Cart[] = [
  {
    userId: '1',
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 1,
      },
      {
        id: '2',
        productId: '3',
        quantity: 2,
      },
    ],
  },
];

// Mock orders
export const orders: Order[] = [
  {
    id: '1',
    userId: '1',
    items: [
      {
        productId: '2',
        name: 'Smart Watch',
        price: 249.99,
        quantity: 1,
      },
    ],
    totalAmount: 249.99,
    status: 'delivered',
    createdAt: '2023-05-15T10:30:00Z',
  },
];

// Helper function to generate a token for a user
export function generateMockToken(user: User) {
  return `mock-token-${user.id}-${Date.now()}`;
} 