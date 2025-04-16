import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Get order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch order: ${response.status}`);
    }
    
    const order = await response.json();
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Cancel an order
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 