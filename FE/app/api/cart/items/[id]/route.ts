import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { carts, products } from '../../../mock-db';

const API_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';

// Update cart item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const itemId = params.id;
  
  try {
    const { quantity } = await request.json();
    
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
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
      console.log('Using mock cart data for updating item');
      
      // Simulate user ID from token
      const userId = '1'; // Default to first user in mock data
      
      // Find user's cart
      const userCart = carts.find(cart => cart.userId === userId);
      
      if (!userCart) {
        return NextResponse.json(
          { error: 'Cart not found' },
          { status: 404 }
        );
      }
      
      // Find item in cart
      const cartItem = userCart.items.find(item => item.id === itemId);
      
      if (!cartItem) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        );
      }
      
      // Update quantity
      cartItem.quantity = quantity;
      
      return NextResponse.json({ success: true, message: 'Item updated' });
    }
    
    // Real API call
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to update item' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// Delete cart item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const itemId = params.id;
  
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
      console.log('Using mock cart data for removing item');
      
      // Simulate user ID from token
      const userId = '1'; // Default to first user in mock data
      
      // Find user's cart
      const userCart = carts.find(cart => cart.userId === userId);
      
      if (!userCart) {
        return NextResponse.json(
          { error: 'Cart not found' },
          { status: 404 }
        );
      }
      
      // Find item index in cart
      const itemIndex = userCart.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        );
      }
      
      // Remove item from cart
      userCart.items.splice(itemIndex, 1);
      
      return NextResponse.json({ success: true, message: 'Item removed from cart' });
    }
    
    // Real API call
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to remove item' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
} 