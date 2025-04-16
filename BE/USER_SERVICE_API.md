# User Service API Documentation

## Base URL

```
http://localhost:8002/api/users
```

## Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Register User

```
POST /api/users/register
```

**Description:** Register a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+1234567890"
}
```

**Response Example:**
```json
{
  "message": "User registered successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "verificationEmailSent": true
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Validation errors
- 409: Conflict - Email already registered

### Verify Email

```
GET /api/users/verify-email/:token
```

**Description:** Verify a user's email address using the token sent via email.

**Authentication:** Not required

**Path Parameters:**
- token: Email verification token

**Response Example:**
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid or expired token

### Login

```
POST /api/users/login
```

**Description:** Authenticate user and get access token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response Example:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "customer",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid credentials
- 401: Unauthorized - Account not verified

### Refresh Token

```
POST /api/users/refresh-token
```

**Description:** Get a new access token using refresh token.

**Authentication:** Not required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Example:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized - Invalid refresh token

### Logout

```
POST /api/users/logout
```

**Description:** Invalidate the current refresh token.

**Authentication:** Required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Example:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

### Forgot Password

```
POST /api/users/forgot-password
```

**Description:** Request a password reset email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response Example:**
```json
{
  "message": "Password reset email sent",
  "emailSent": true
}
```

**Status Codes:**
- 200: Success
- 404: Email not found

### Reset Password

```
POST /api/users/reset-password/:token
```

**Description:** Reset password using the token received via email.

**Authentication:** Not required

**Path Parameters:**
- token: Password reset token

**Request Body:**
```json
{
  "password": "NewSecurePassword123!"
}
```

**Response Example:**
```json
{
  "message": "Password reset successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid or expired token
- 400: Bad Request - Password validation failed

### Get Current User

```
GET /api/users/me
```

**Description:** Get the profile of the current authenticated user.

**Authentication:** Required

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "role": "customer",
  "verified": true,
  "createdAt": "2023-03-15T10:30:45Z",
  "updatedAt": "2023-05-18T14:20:30Z",
  "addresses": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "shipping",
      "isDefault": true,
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "phoneNumber": "+1234567890"
    }
  ],
  "preferences": {
    "marketing": true,
    "newsletter": true,
    "language": "en-US",
    "currency": "USD"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

### Update User Profile

```
PATCH /api/users/me
```

**Description:** Update the current user's profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phoneNumber": "+9876543210",
  "preferences": {
    "marketing": false,
    "newsletter": true,
    "language": "en-UK",
    "currency": "GBP"
  }
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Johnny",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+9876543210",
  "updated": true,
  "updatedAt": "2023-05-20T11:15:30Z",
  "preferences": {
    "marketing": false,
    "newsletter": true,
    "language": "en-UK",
    "currency": "GBP"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Validation errors
- 401: Unauthorized

### Change Password

```
POST /api/users/change-password
```

**Description:** Change the current user's password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "EvenMoreSecure456!"
}
```

**Response Example:**
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Password validation failed
- 401: Unauthorized - Current password is incorrect

### Add User Address

```
POST /api/users/me/addresses
```

**Description:** Add a new address to the user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "type": "billing",
  "isDefault": true,
  "fullName": "John Doe",
  "street": "456 Business Ave",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601",
  "country": "USA",
  "phoneNumber": "+1234567890"
}
```

**Response Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "type": "billing",
  "isDefault": true,
  "fullName": "John Doe",
  "street": "456 Business Ave",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601",
  "country": "USA",
  "phoneNumber": "+1234567890",
  "createdAt": "2023-05-20T16:45:30Z"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Validation errors
- 401: Unauthorized

### Update User Address

```
PUT /api/users/me/addresses/:addressId
```

**Description:** Update an existing address.

**Authentication:** Required

**Path Parameters:**
- addressId: The UUID of the address to update

**Request Body:**
```json
{
  "type": "billing",
  "isDefault": true,
  "fullName": "John Doe",
  "street": "789 Corporate Blvd",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60602",
  "country": "USA",
  "phoneNumber": "+1234567890"
}
```

**Response Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "type": "billing",
  "isDefault": true,
  "fullName": "John Doe",
  "street": "789 Corporate Blvd",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60602",
  "country": "USA",
  "phoneNumber": "+1234567890",
  "updatedAt": "2023-05-21T09:20:15Z"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Validation errors
- 401: Unauthorized
- 404: Address not found

### Delete User Address

```
DELETE /api/users/me/addresses/:addressId
```

**Description:** Delete an address from the user's profile.

**Authentication:** Required

**Path Parameters:**
- addressId: The UUID of the address to delete

**Response Example:**
```json
{
  "message": "Address deleted successfully",
  "id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Address not found

### Get User Payment Methods

```
GET /api/users/me/payment-methods
```

**Description:** Retrieve saved payment methods for the current user.

**Authentication:** Required

**Response Example:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_550e8400e29b41d4a716446655440000",
      "type": "credit_card",
      "isDefault": true,
      "cardBrand": "visa",
      "lastFourDigits": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cardholderName": "John Doe",
      "billingAddressId": "770e8400-e29b-41d4-a716-446655440002",
      "createdAt": "2023-04-15T10:30:45Z"
    },
    {
      "id": "pm_660e8400e29b41d4a716446655440001",
      "type": "paypal",
      "isDefault": false,
      "email": "john.doe@example.com",
      "createdAt": "2023-05-10T14:20:30Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

### Add Payment Method

```
POST /api/users/me/payment-methods
```

**Description:** Add a new payment method to the user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "type": "credit_card",
  "isDefault": true,
  "paymentToken": "tok_visa_1234567890",
  "cardholderName": "John Doe",
  "billingAddressId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response Example:**
```json
{
  "id": "pm_550e8400e29b41d4a716446655440000",
  "type": "credit_card",
  "isDefault": true,
  "cardBrand": "visa",
  "lastFourDigits": "4242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cardholderName": "John Doe",
  "billingAddressId": "770e8400-e29b-41d4-a716-446655440002",
  "createdAt": "2023-04-15T10:30:45Z"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Validation errors
- 401: Unauthorized

### Delete Payment Method

```
DELETE /api/users/me/payment-methods/:paymentMethodId
```

**Description:** Delete a payment method from the user's profile.

**Authentication:** Required

**Path Parameters:**
- paymentMethodId: The ID of the payment method to delete

**Response Example:**
```json
{
  "message": "Payment method deleted successfully",
  "id": "pm_550e8400e29b41d4a716446655440000"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Payment method not found

### Set Default Payment Method

```
PATCH /api/users/me/payment-methods/:paymentMethodId/default
```

**Description:** Set a payment method as the default.

**Authentication:** Required

**Path Parameters:**
- paymentMethodId: The ID of the payment method to set as default

**Response Example:**
```json
{
  "message": "Default payment method updated",
  "id": "pm_660e8400e29b41d4a716446655440001",
  "isDefault": true
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Payment method not found

## Admin Endpoints

### List Users (Admin Only)

```
GET /api/admin/users
```

**Description:** Retrieve a paginated list of all users.

**Authentication:** Required (Admin role)

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of users per page (default: 20)
- search: Search term for name or email
- role: Filter by user role (customer, admin)
- verified: Filter by verification status (true/false)
- sortBy: Field to sort by (createdAt, lastName, email)
- sortOrder: Sort order (asc or desc, default: desc)
- startDate: Filter users created after this date (ISO format)
- endDate: Filter users created before this date (ISO format)

**Response Example:**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "verified": true,
      "phoneNumber": "+1234567890",
      "createdAt": "2023-03-15T10:30:45Z",
      "lastLoginAt": "2023-05-25T08:15:30Z",
      "ordersCount": 5,
      "totalSpent": 1529.97
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "role": "customer",
      "verified": true,
      "phoneNumber": "+9876543210",
      "createdAt": "2023-04-20T14:45:30Z",
      "lastLoginAt": "2023-05-24T16:30:15Z",
      "ordersCount": 2,
      "totalSpent": 449.98
    }
  ],
  "pagination": {
    "total": 250,
    "pages": 13,
    "currentPage": 1,
    "limit": 20
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not an admin

### Get User by ID (Admin Only)

```
GET /api/admin/users/:userId
```

**Description:** Retrieve detailed information about a specific user.

**Authentication:** Required (Admin role)

**Path Parameters:**
- userId: The UUID of the user to retrieve

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "role": "customer",
  "verified": true,
  "createdAt": "2023-03-15T10:30:45Z",
  "updatedAt": "2023-05-18T14:20:30Z",
  "lastLoginAt": "2023-05-25T08:15:30Z",
  "addresses": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "shipping",
      "isDefault": true,
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "phoneNumber": "+1234567890"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "type": "billing",
      "isDefault": true,
      "fullName": "John Doe",
      "street": "789 Corporate Blvd",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60602",
      "country": "USA",
      "phoneNumber": "+1234567890"
    }
  ],
  "paymentMethods": [
    {
      "id": "pm_550e8400e29b41d4a716446655440000",
      "type": "credit_card",
      "isDefault": true,
      "cardBrand": "visa",
      "lastFourDigits": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025
    }
  ],
  "orderSummary": {
    "totalOrders": 5,
    "totalSpent": 1529.97,
    "averageOrderValue": 305.99,
    "firstOrderDate": "2023-03-20T09:15:30Z",
    "lastOrderDate": "2023-05-22T10:30:45Z"
  },
  "notes": [
    {
      "id": "note_123456789",
      "content": "Customer requested special shipping arrangements",
      "createdBy": "admin@example.com",
      "createdAt": "2023-05-15T14:20:30Z"
    }
  ],
  "activityLog": [
    {
      "action": "account_created",
      "timestamp": "2023-03-15T10:30:45Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    {
      "action": "password_changed",
      "timestamp": "2023-04-20T16:45:30Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    {
      "action": "login",
      "timestamp": "2023-05-25T08:15:30Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: User not found

### Create User (Admin Only)

```
POST /api/admin/users
```

**Description:** Create a new user account.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+1122334455",
  "role": "customer",
  "verified": true,
  "sendWelcomeEmail": true
}
```

**Response Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "phoneNumber": "+1122334455",
  "role": "customer",
  "verified": true,
  "createdAt": "2023-05-26T11:30:45Z",
  "message": "User created successfully",
  "welcomeEmailSent": true
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Validation errors
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 409: Conflict - Email already registered

### Update User (Admin Only)

```
PUT /api/admin/users/:userId
```

**Description:** Update a user's information.

**Authentication:** Required (Admin role)

**Path Parameters:**
- userId: The UUID of the user to update

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Williams",
  "email": "alice.williams@example.com",
  "phoneNumber": "+1122334455",
  "role": "admin",
  "verified": true,
  "notes": "Promoted to admin role on May 26, 2023"
}
```

**Response Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "firstName": "Alice",
  "lastName": "Williams",
  "email": "alice.williams@example.com",
  "phoneNumber": "+1122334455",
  "role": "admin",
  "verified": true,
  "updatedAt": "2023-05-26T14:20:30Z",
  "message": "User updated successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Validation errors
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: User not found
- 409: Conflict - Email already registered

### Delete User (Admin Only)

```
DELETE /api/admin/users/:userId
```

**Description:** Delete a user account.

**Authentication:** Required (Admin role)

**Path Parameters:**
- userId: The UUID of the user to delete

**Query Parameters:**
- anonymize: If true, anonymize user data instead of deleting (default: false)

**Response Example:**
```json
{
  "message": "User deleted successfully",
  "id": "770e8400-e29b-41d4-a716-446655440003"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not an admin or trying to delete an admin
- 404: User not found

### Add Admin Note (Admin Only)

```
POST /api/admin/users/:userId/notes
```

**Description:** Add a note to a user account.

**Authentication:** Required (Admin role)

**Path Parameters:**
- userId: The UUID of the user

**Request Body:**
```json
{
  "content": "Customer requested special shipping arrangements for all future orders"
}
```

**Response Example:**
```json
{
  "id": "note_987654321",
  "content": "Customer requested special shipping arrangements for all future orders",
  "createdBy": "admin@example.com",
  "createdAt": "2023-05-26T15:45:30Z"
}
```

**Status Codes:**
- 201: Created
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: User not found

## Error Responses

All endpoints may return the following error responses:

**Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  ]
}
```

**Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Authentication Error:**
```json
{
  "error": "Authentication Error",
  "message": "Invalid or expired token"
}
```

**Authorization Error:**
```json
{
  "error": "Authorization Error",
  "message": "You do not have permission to access this resource"
}
``` 