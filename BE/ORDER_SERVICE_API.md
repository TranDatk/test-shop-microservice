# Order Service API Documentation

## Base URL

```
http://localhost:8001/api/orders
```

## Authentication

All order endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Get Current User Orders

```
GET /api/orders
```

**Description:** Retrieves a paginated list of orders for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of orders per page (default: 10)
- status: Filter by order status (pending, processing, shipped, delivered, cancelled)
- sortBy: Field to sort by (createdAt, totalAmount)
- sortOrder: Sort order (asc or desc, default: desc)

**Response Example:**
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "delivered",
      "totalAmount": 999.98,
      "paymentStatus": "paid",
      "paymentMethod": "credit_card",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "trackingNumber": "TRK123456789",
      "createdAt": "2023-05-15T10:30:45Z",
      "updatedAt": "2023-05-18T14:20:30Z",
      "items": [
        {
          "productId": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Smartphone X",
          "price": 799.99,
          "quantity": 1,
          "imageUrl": "https://example.com/images/smartphone-x.jpg"
        },
        {
          "productId": "660e8400-e29b-41d4-a716-446655440001",
          "name": "Phone Case",
          "price": 19.99,
          "quantity": 1,
          "imageUrl": "https://example.com/images/phone-case.jpg"
        }
      ]
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "processing",
      "totalAmount": 199.99,
      "paymentStatus": "paid",
      "paymentMethod": "paypal",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "trackingNumber": null,
      "createdAt": "2023-05-20T15:45:30Z",
      "updatedAt": "2023-05-20T15:45:30Z",
      "items": [
        {
          "productId": "660e8400-e29b-41d4-a716-446655440001",
          "name": "Wireless Headphones",
          "price": 199.99,
          "quantity": 1,
          "imageUrl": "https://example.com/images/wireless-headphones.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "total": 5,
    "pages": 1,
    "currentPage": 1,
    "limit": 10
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

### Get Order by ID

```
GET /api/orders/:orderId
```

**Description:** Retrieves detailed information about a specific order.

**Authentication:** Required (must be the order owner or admin)

**Path Parameters:**
- orderId: The UUID of the order to retrieve

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "aa0e8400-e29b-41d4-a716-446655440000",
  "status": "delivered",
  "totalAmount": 999.98,
  "subtotal": 819.98,
  "tax": 80.00,
  "shippingCost": 100.00,
  "discount": 0,
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "transactionId": "txn_123456789",
    "paidAt": "2023-05-15T10:35:12Z"
  },
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "trackingNumber": "TRK123456789",
  "shippedAt": "2023-05-16T09:20:15Z",
  "deliveredAt": "2023-05-18T14:20:30Z",
  "notes": "Please leave the package at the door",
  "createdAt": "2023-05-15T10:30:45Z",
  "updatedAt": "2023-05-18T14:20:30Z",
  "items": [
    {
      "id": "10e0d400-e29b-41d4-a716-446655440001",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone X",
      "description": "Latest smartphone with advanced features",
      "price": 799.99,
      "quantity": 1,
      "imageUrl": "https://example.com/images/smartphone-x.jpg",
      "subtotal": 799.99
    },
    {
      "id": "20e0d400-e29b-41d4-a716-446655440002",
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Phone Case",
      "description": "Protective case for Smartphone X",
      "price": 19.99,
      "quantity": 1,
      "imageUrl": "https://example.com/images/phone-case.jpg",
      "subtotal": 19.99
    }
  ],
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2023-05-15T10:30:45Z",
      "note": "Order placed"
    },
    {
      "status": "processing",
      "timestamp": "2023-05-15T10:35:12Z",
      "note": "Payment confirmed"
    },
    {
      "status": "shipped",
      "timestamp": "2023-05-16T09:20:15Z",
      "note": "Order shipped via Express Shipping"
    },
    {
      "status": "delivered",
      "timestamp": "2023-05-18T14:20:30Z",
      "note": "Order delivered"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not the order owner or admin
- 404: Order not found

### Create Order

```
POST /api/orders
```

**Description:** Creates a new order.

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    },
    {
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "paymentMethod": "credit_card",
  "notes": "Please leave the package at the door",
  "couponCode": "SUMMER2023"
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "userId": "aa0e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "totalAmount": 1019.97,
  "subtotal": 899.97,
  "tax": 90.00,
  "shippingCost": 50.00,
  "discount": 20.00,
  "paymentStatus": "pending",
  "paymentMethod": "credit_card",
  "paymentUrl": "https://payment-gateway.example.com/pay/550e8400-e29b-41d4-a716-446655440005",
  "expiresAt": "2023-05-22T10:30:45Z",
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phoneNumber": "+1234567890"
  },
  "notes": "Please leave the package at the door",
  "createdAt": "2023-05-22T10:30:45Z",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone X",
      "description": "Latest smartphone with advanced features",
      "price": 799.99,
      "quantity": 1,
      "imageUrl": "https://example.com/images/smartphone-x.jpg",
      "subtotal": 799.99
    },
    {
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Phone Case",
      "description": "Protective case for Smartphone X",
      "price": 19.99,
      "quantity": 2,
      "imageUrl": "https://example.com/images/phone-case.jpg",
      "subtotal": 39.98
    }
  ],
  "couponApplied": {
    "code": "SUMMER2023",
    "discount": 20.00
  },
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2023-05-22T10:30:45Z",
      "note": "Order placed"
    }
  ]
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Invalid input or insufficient stock
- 401: Unauthorized

### Cancel Order

```
PATCH /api/orders/:orderId/cancel
```

**Description:** Cancels an order that is in pending or processing status.

**Authentication:** Required (must be the order owner)

**Path Parameters:**
- orderId: The UUID of the order to cancel

**Request Body:**
```json
{
  "reason": "Found a better deal elsewhere"
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "status": "cancelled",
  "cancelledAt": "2023-05-22T12:15:30Z",
  "cancelReason": "Found a better deal elsewhere",
  "message": "Order has been cancelled successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Order cannot be cancelled (already shipped or delivered)
- 401: Unauthorized
- 403: Forbidden - Not the order owner
- 404: Order not found

### Process Payment Webhook

```
POST /api/orders/payment-webhook
```

**Description:** Endpoint for payment processor to notify about payment status changes. This is typically called by the payment service provider.

**Authentication:** Special API key from payment provider

**Headers:**
- X-Payment-Signature: Hash signature from payment provider for verification

**Request Body:**
```json
{
  "event": "payment.succeeded",
  "orderId": "550e8400-e29b-41d4-a716-446655440005",
  "transactionId": "txn_987654321",
  "amount": 1019.97,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "paidAt": "2023-05-22T11:30:45Z",
  "metadata": {
    "customerId": "aa0e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "orderId": "550e8400-e29b-41d4-a716-446655440005",
  "newStatus": "processing"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid webhook data
- 401: Unauthorized - Invalid signature
- 404: Order not found
- 409: Conflict - Payment already processed

## Admin Endpoints

### List All Orders (Admin Only)

```
GET /api/admin/orders
```

**Description:** Retrieves a paginated list of all orders in the system.

**Authentication:** Required (Admin role)

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of orders per page (default: 20)
- userId: Filter by user ID
- status: Filter by order status (pending, processing, shipped, delivered, cancelled)
- paymentStatus: Filter by payment status (pending, paid, failed, refunded)
- startDate: Filter orders created after this date (ISO format)
- endDate: Filter orders created before this date (ISO format)
- minAmount: Minimum order amount
- maxAmount: Maximum order amount
- sortBy: Field to sort by (createdAt, totalAmount, status)
- sortOrder: Sort order (asc or desc, default: desc)

**Response Example:**
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "aa0e8400-e29b-41d4-a716-446655440000",
      "userName": "John Doe",
      "userEmail": "john.doe@example.com",
      "status": "delivered",
      "totalAmount": 999.98,
      "paymentStatus": "paid",
      "paymentMethod": "credit_card",
      "createdAt": "2023-05-15T10:30:45Z",
      "updatedAt": "2023-05-18T14:20:30Z",
      "itemCount": 2
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "userId": "bb0e8400-e29b-41d4-a716-446655440000",
      "userName": "Jane Smith",
      "userEmail": "jane.smith@example.com",
      "status": "processing",
      "totalAmount": 199.99,
      "paymentStatus": "paid",
      "paymentMethod": "paypal",
      "createdAt": "2023-05-20T15:45:30Z",
      "updatedAt": "2023-05-20T15:45:30Z",
      "itemCount": 1
    }
  ],
  "pagination": {
    "total": 100,
    "pages": 5,
    "currentPage": 1,
    "limit": 20
  },
  "summary": {
    "totalOrders": 100,
    "pendingOrders": 25,
    "processingOrders": 30,
    "shippedOrders": 20,
    "deliveredOrders": 15,
    "cancelledOrders": 10,
    "totalRevenue": 25678.43
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not an admin

### Update Order Status (Admin Only)

```
PATCH /api/admin/orders/:orderId/status
```

**Description:** Updates the status of an order.

**Authentication:** Required (Admin role)

**Path Parameters:**
- orderId: The UUID of the order to update

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK987654321",
  "carrier": "FedEx",
  "note": "Shipped via Express Delivery"
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "shipped",
  "previousStatus": "processing",
  "trackingNumber": "TRK987654321",
  "carrier": "FedEx",
  "shippedAt": "2023-05-25T09:15:30Z",
  "updatedAt": "2023-05-25T09:15:30Z",
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2023-05-15T10:30:45Z",
      "note": "Order placed"
    },
    {
      "status": "processing",
      "timestamp": "2023-05-15T10:35:12Z",
      "note": "Payment confirmed"
    },
    {
      "status": "shipped",
      "timestamp": "2023-05-25T09:15:30Z",
      "note": "Shipped via Express Delivery"
    }
  ],
  "message": "Order status updated successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid status transition
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Order not found

### Issue Refund (Admin Only)

```
POST /api/admin/orders/:orderId/refund
```

**Description:** Issues a refund for an order.

**Authentication:** Required (Admin role)

**Path Parameters:**
- orderId: The UUID of the order to refund

**Request Body:**
```json
{
  "amount": 999.98,
  "reason": "Customer request",
  "refundToOriginalPaymentMethod": true,
  "note": "Customer changed their mind"
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "refundId": "ref_12345678",
  "amount": 999.98,
  "refundedAt": "2023-05-26T11:20:45Z",
  "paymentStatus": "refunded",
  "reason": "Customer request",
  "note": "Customer changed their mind",
  "status": "cancelled",
  "message": "Refund processed successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid refund request (e.g., amount exceeds order total)
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Order not found
- 422: Unprocessable Entity - Payment gateway rejected refund

### Generate Order Report (Admin Only)

```
GET /api/admin/orders/reports
```

**Description:** Generates a report of orders based on specified criteria.

**Authentication:** Required (Admin role)

**Query Parameters:**
- format: Report format (csv, pdf, json, default: json)
- startDate: Start date for report period (ISO format, required)
- endDate: End date for report period (ISO format, required)
- status: Filter by order status (optional)
- groupBy: Group results by (daily, weekly, monthly, default: daily)

**Response Example (JSON format):**
```json
{
  "reportId": "rep_98765432",
  "generatedAt": "2023-05-30T14:00:00Z",
  "period": {
    "startDate": "2023-05-01T00:00:00Z",
    "endDate": "2023-05-31T23:59:59Z"
  },
  "totals": {
    "orders": 250,
    "revenue": 35450.87,
    "tax": 3180.45,
    "shipping": 2500.00,
    "averageOrderValue": 141.80
  },
  "data": [
    {
      "date": "2023-05-01",
      "orders": 8,
      "revenue": 1205.43,
      "tax": 108.45,
      "shipping": 80.00,
      "averageOrderValue": 150.68,
      "statusBreakdown": {
        "pending": 0,
        "processing": 0,
        "shipped": 0,
        "delivered": 8,
        "cancelled": 0
      }
    },
    {
      "date": "2023-05-02",
      "orders": 12,
      "revenue": 1789.32,
      "tax": 160.98,
      "shipping": 120.00,
      "averageOrderValue": 149.11,
      "statusBreakdown": {
        "pending": 0,
        "processing": 0,
        "shipped": 1,
        "delivered": 11,
        "cancelled": 0
      }
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid parameters
- 401: Unauthorized
- 403: Forbidden - Not an admin

## Error Responses

All endpoints may return the following error responses:

**Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "items",
      "message": "At least one item is required"
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