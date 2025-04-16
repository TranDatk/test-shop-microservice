import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { users } from '../../mock-db';

const API_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004';

export async function GET() {
  // Check if we should use mock data
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (useMockData) {
    console.log('Using mock user profile data');
    // For mock auth, extract user ID from token
    // Format: mock-token-{userId}-{timestamp}
    const tokenParts = token.split('-');
    const userId = tokenParts.length >= 3 ? tokenParts[2] : null;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Find user by ID
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  }
  
  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }
    
    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 