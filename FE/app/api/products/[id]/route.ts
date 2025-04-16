import { NextResponse } from 'next/server';
import { products } from '../../mock-db';

const API_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  try {
    if (useMockData) {
      console.log('Using mock product data for detail');
      // Find product in mock data
      const product = products.find(p => p.id === id);
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Add some additional mock data for the product detail
      const enrichedProduct = {
        ...product,
        features: [
          'High quality audio with noise cancellation',
          'Bluetooth 5.0 connectivity',
          '30-hour battery life',
          'Comfortable over-ear design',
          'Built-in microphone for calls'
        ],
        specifications: {
          'Brand': 'TechAudio',
          'Model': 'PA-2023',
          'Color': 'Black',
          'Connectivity': 'Bluetooth 5.0',
          'Battery Life': '30 hours',
          'Weight': '250g',
          'Warranty': '2 years'
        }
      };
      
      return NextResponse.json(enrichedProduct);
    }
    
    // Real API call
    const response = await fetch(`${API_URL}/api/products/${id}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product details:', error);
    
    // If API is unavailable and USE_MOCK_DATA is not set, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock data for product detail');
      const product = products.find(p => p.id === id);
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Add some additional mock data
      const enrichedProduct = {
        ...product,
        features: [
          'High quality audio with noise cancellation',
          'Bluetooth 5.0 connectivity',
          '30-hour battery life',
          'Comfortable over-ear design',
          'Built-in microphone for calls'
        ],
        specifications: {
          'Brand': 'TechAudio',
          'Model': 'PA-2023',
          'Color': 'Black',
          'Connectivity': 'Bluetooth 5.0',
          'Battery Life': '30 hours',
          'Weight': '250g',
          'Warranty': '2 years'
        }
      };
      
      return NextResponse.json(enrichedProduct);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 