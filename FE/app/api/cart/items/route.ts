import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { carts, products } from '../../mock-db';

const API_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';

// Helper to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// GET cart items
export async function GET() {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  try {
    // Get user info from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token && !useMockData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (useMockData) {
      console.log('Using mock cart data');
      
      // Simulate user ID from token
      const userId = '1'; // Default to first user in mock data
      const userCart = carts.find(cart => cart.userId === userId) || { userId, items: [] };
      
      // Enhance cart items with product details
      const cartWithDetails = {
        items: userCart.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: product ? {
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl
            } : null
          };
        }),
        totalItems: userCart.items.length,
        subtotal: userCart.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0)
      };
      
      return NextResponse.json(cartWithDetails);
    }
    
    // Real API call
    const response = await fetch(`${API_URL}/api/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }
    
    const cartData = await response.json();
    return NextResponse.json(cartData);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: Request) {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  try {
    const { productId, quantity } = await request.json();
    
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }
    
    // Get user info from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token && !useMockData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (useMockData) {
      console.log('Using mock cart data for adding item');
      
      // Validate product exists
      const productExists = products.some(p => p.id === productId);
      if (!productExists) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Simulate user ID from token
      const userId = '1'; // Default to first user in mock data
      
      // Find user's cart
      let userCart = carts.find(cart => cart.userId === userId);
      
      // If no cart exists, create one
      if (!userCart) {
        userCart = { userId, items: [] };
        carts.push(userCart);
      }
      
      // Check if item already exists
      const existingItemIndex = userCart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        userCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        userCart.items.push({
          id: generateId(),
          productId,
          quantity
        });
      }
      
      return NextResponse.json({ success: true, message: 'Item added to cart' });
    }
    
    // Real API call
    const response = await fetch(`${API_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to add item to cart' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
} 