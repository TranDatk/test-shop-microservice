import { NextResponse } from 'next/server';
import { products } from '../mock-db';

const API_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

export async function GET() {
  // Check if we should use mock data
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  if (useMockData) {
    console.log('Using mock product data');
    // Return mock data in the same format as the real API
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
  }
  
  try {
    const response = await fetch(`${API_URL}/api/products`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    // Just pass through the API response as is
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    // If API is unavailable and USE_MOCK_DATA is not set, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock data');
      return NextResponse.json({
        success: true,
        count: products.length,
        data: products
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 