import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { users, generateMockToken } from '../../mock-db';

const API_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  // Check if we should use mock data
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    if (useMockData) {
      console.log('Using mock authentication');
      // For mock auth, check credentials against mock users
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      // Generate a mock token
      const token = generateMockToken(user);
      
      // Create clean user object without password
      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      // Set the auth token in cookie
      const response = NextResponse.json({
        user: userWithoutPassword
      });
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return response;
    }
    
    // Real API call if not using mock data
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      // Get detailed error message if available
      let errorMessage = 'Authentication failed';
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Ignore json parsing errors
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status || 500 }
      );
    }
    
    const data = await response.json();
    
    // Set the access token in a cookie
    const response2 = NextResponse.json({
      user: {
        email: data.email || email,
        name: data.name || email.split('@')[0],
        id: data.sub || 'unknown',
        role: data.realm_access?.roles?.includes('admin') ? 'admin' : 'user'
      }
    });
    
    response2.cookies.set('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in || 60 * 60 * 24 * 7, // Use expires_in from response or default to 1 week
      path: '/',
    });
    
    return response2;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again later.' },
      { status: 500 }
    );
  }
} 