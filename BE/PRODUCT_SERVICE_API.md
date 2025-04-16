# Product Service API Documentation

## Base URL

```
http://localhost:8000/api/products
```

## Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### List Products

```
GET /api/products
```

**Description:** Retrieves a paginated list of products.

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of products per page (default: 10)
- search: Search term to filter products by name or description
- category: Filter by category ID
- minPrice: Minimum price filter
- maxPrice: Maximum price filter
- sortBy: Field to sort by (name, price, createdAt)
- sortOrder: Sort order (asc or desc, default: asc)

**Response Example:**
```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone X",
      "description": "Latest smartphone with advanced features",
      "price": 799.99,
      "category": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "Electronics"
      },
      "imageUrl": "https://example.com/images/smartphone-x.jpg",
      "stock": 45,
      "rating": 4.5,
      "reviewCount": 210,
      "createdAt": "2023-05-15T10:30:45Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Wireless Headphones",
      "description": "High-quality noise-canceling headphones",
      "price": 199.99,
      "category": {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "name": "Electronics"
      },
      "imageUrl": "https://example.com/images/wireless-headphones.jpg",
      "stock": 28,
      "rating": 4.8,
      "reviewCount": 156,
      "createdAt": "2023-05-10T14:20:30Z"
    }
  ],
  "pagination": {
    "total": 42,
    "pages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid query parameters

### Get Product by ID

```
GET /api/products/:productId
```

**Description:** Retrieves detailed information about a specific product.

**Authentication:** Optional (public endpoint)

**Path Parameters:**
- productId: The UUID of the product to retrieve

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smartphone X",
  "description": "Latest smartphone with advanced features and a high-resolution display. Includes a powerful processor and an advanced camera system.",
  "price": 799.99,
  "category": {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Electronics"
  },
  "imageUrl": "https://example.com/images/smartphone-x.jpg",
  "images": [
    "https://example.com/images/smartphone-x-1.jpg",
    "https://example.com/images/smartphone-x-2.jpg",
    "https://example.com/images/smartphone-x-3.jpg"
  ],
  "stock": 45,
  "specifications": {
    "brand": "TechBrand",
    "model": "X-2023",
    "dimensions": "147.5 x 71.5 x 7.4 mm",
    "weight": "175g",
    "displaySize": "6.1 inches",
    "batteryCapacity": "4000 mAh",
    "operatingSystem": "Android 13"
  },
  "rating": 4.5,
  "reviewCount": 210,
  "createdAt": "2023-05-15T10:30:45Z",
  "updatedAt": "2023-05-15T10:30:45Z"
}
```

**Status Codes:**
- 200: Success
- 404: Product not found

### Create Product (Admin Only)

```
POST /api/products
```

**Description:** Creates a new product.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "New Smart Watch",
  "description": "Innovative smart watch with health monitoring features",
  "price": 249.99,
  "categoryId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "imageUrl": "https://example.com/images/smart-watch.jpg",
  "images": [
    "https://example.com/images/smart-watch-1.jpg",
    "https://example.com/images/smart-watch-2.jpg"
  ],
  "stock": 30,
  "specifications": {
    "brand": "TechBrand",
    "model": "Watch Pro",
    "dimensions": "42 x 36 x 10.7 mm",
    "weight": "32g",
    "displaySize": "1.4 inches",
    "batteryLife": "48 hours",
    "waterResistant": true
  }
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "New Smart Watch",
  "description": "Innovative smart watch with health monitoring features",
  "price": 249.99,
  "category": {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Electronics"
  },
  "imageUrl": "https://example.com/images/smart-watch.jpg",
  "images": [
    "https://example.com/images/smart-watch-1.jpg",
    "https://example.com/images/smart-watch-2.jpg"
  ],
  "stock": 30,
  "specifications": {
    "brand": "TechBrand",
    "model": "Watch Pro",
    "dimensions": "42 x 36 x 10.7 mm",
    "weight": "32g",
    "displaySize": "1.4 inches",
    "batteryLife": "48 hours",
    "waterResistant": true
  },
  "rating": 0,
  "reviewCount": 0,
  "createdAt": "2023-05-20T09:15:30Z"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Invalid input
- 401: Unauthorized
- 403: Forbidden - Not an admin

### Update Product (Admin Only)

```
PUT /api/products/:productId
```

**Description:** Updates an existing product's information.

**Authentication:** Required (Admin role)

**Path Parameters:**
- productId: The UUID of the product to update

**Request Body:**
```json
{
  "name": "Updated Smart Watch",
  "description": "Improved version with new features",
  "price": 279.99,
  "categoryId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "stock": 25,
  "imageUrl": "https://example.com/images/updated-watch.jpg",
  "specifications": {
    "brand": "TechBrand",
    "model": "Watch Pro 2",
    "batteryLife": "72 hours",
    "waterResistant": true
  }
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Updated Smart Watch",
  "description": "Improved version with new features",
  "price": 279.99,
  "category": {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Electronics"
  },
  "imageUrl": "https://example.com/images/updated-watch.jpg",
  "stock": 25,
  "specifications": {
    "brand": "TechBrand",
    "model": "Watch Pro 2",
    "dimensions": "42 x 36 x 10.7 mm",
    "weight": "32g",
    "displaySize": "1.4 inches",
    "batteryLife": "72 hours",
    "waterResistant": true
  },
  "updatedAt": "2023-05-25T11:30:15Z"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid input
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Product not found

### Delete Product (Admin Only)

```
DELETE /api/products/:productId
```

**Description:** Removes a product from the system.

**Authentication:** Required (Admin role)

**Path Parameters:**
- productId: The UUID of the product to delete

**Response Example:**
```json
{
  "message": "Product successfully deleted",
  "id": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Product not found

### Update Product Stock (Admin Only)

```
PATCH /api/products/:productId/stock
```

**Description:** Updates the stock quantity of a product.

**Authentication:** Required (Admin role)

**Path Parameters:**
- productId: The UUID of the product to update

**Request Body:**
```json
{
  "stock": 50
}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Smartphone X",
  "stock": 50,
  "updatedAt": "2023-05-28T13:45:20Z"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid input
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Product not found

## Category Endpoints

### List Categories

```
GET /api/products/categories
```

**Description:** Retrieves a list of all product categories.

**Authentication:** Optional (public endpoint)

**Response Example:**
```json
{
  "categories": [
    {
      "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "imageUrl": "https://example.com/images/electronics.jpg"
    },
    {
      "id": "2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p",
      "name": "Clothing",
      "description": "Apparel and fashion items",
      "imageUrl": "https://example.com/images/clothing.jpg"
    }
  ]
}
```

**Status Codes:**
- 200: Success

### Get Products by Category

```
GET /api/products/categories/:categoryId
```

**Description:** Retrieves products belonging to a specific category.

**Authentication:** Optional (public endpoint)

**Path Parameters:**
- categoryId: The UUID of the category

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of products per page (default: 10)
- sortBy: Field to sort by (name, price, createdAt)
- sortOrder: Sort order (asc or desc, default: asc)

**Response Example:**
```json
{
  "category": {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Electronics",
    "description": "Electronic devices and gadgets"
  },
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone X",
      "description": "Latest smartphone with advanced features",
      "price": 799.99,
      "imageUrl": "https://example.com/images/smartphone-x.jpg",
      "stock": 45,
      "rating": 4.5,
      "reviewCount": 210
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Wireless Headphones",
      "description": "High-quality noise-canceling headphones",
      "price": 199.99,
      "imageUrl": "https://example.com/images/wireless-headphones.jpg",
      "stock": 28,
      "rating": 4.8,
      "reviewCount": 156
    }
  ],
  "pagination": {
    "total": 15,
    "pages": 2,
    "currentPage": 1,
    "limit": 10
  }
}
```

**Status Codes:**
- 200: Success
- 404: Category not found

### Create Category (Admin Only)

```
POST /api/products/categories
```

**Description:** Creates a new product category.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Home Appliances",
  "description": "Appliances for home and kitchen",
  "imageUrl": "https://example.com/images/home-appliances.jpg"
}
```

**Response Example:**
```json
{
  "id": "3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p",
  "name": "Home Appliances",
  "description": "Appliances for home and kitchen",
  "imageUrl": "https://example.com/images/home-appliances.jpg",
  "createdAt": "2023-05-30T10:00:15Z"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Invalid input or category already exists
- 401: Unauthorized
- 403: Forbidden - Not an admin

### Update Category (Admin Only)

```
PUT /api/products/categories/:categoryId
```

**Description:** Updates an existing category.

**Authentication:** Required (Admin role)

**Path Parameters:**
- categoryId: The UUID of the category to update

**Request Body:**
```json
{
  "name": "Kitchen Appliances",
  "description": "Modern appliances for your kitchen",
  "imageUrl": "https://example.com/images/kitchen-appliances.jpg"
}
```

**Response Example:**
```json
{
  "id": "3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p",
  "name": "Kitchen Appliances",
  "description": "Modern appliances for your kitchen",
  "imageUrl": "https://example.com/images/kitchen-appliances.jpg",
  "updatedAt": "2023-06-01T14:20:30Z"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid input
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Category not found

### Delete Category (Admin Only)

```
DELETE /api/products/categories/:categoryId
```

**Description:** Removes a category from the system. Products associated with this category will need to be reassigned.

**Authentication:** Required (Admin role)

**Path Parameters:**
- categoryId: The UUID of the category to delete

**Response Example:**
```json
{
  "message": "Category successfully deleted",
  "id": "3a4b5c6d-7e8f-9g0h-1i2j-3k4l5m6n7o8p"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Category still has associated products
- 401: Unauthorized
- 403: Forbidden - Not an admin
- 404: Category not found

## Review Endpoints

### Get Product Reviews

```
GET /api/products/:productId/reviews
```

**Description:** Retrieves reviews for a specific product.

**Authentication:** Optional (public endpoint)

**Path Parameters:**
- productId: The UUID of the product

**Query Parameters:**
- page: Page number (default: 1)
- limit: Number of reviews per page (default: 10)
- sortBy: Field to sort by (createdAt, rating)
- sortOrder: Sort order (asc or desc, default: desc)

**Response Example:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "reviews": [
    {
      "id": "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p",
      "userId": "aa0e8400-e29b-41d4-a716-446655440000",
      "userName": "John D.",
      "rating": 5,
      "comment": "Excellent product, exceeded my expectations!",
      "createdAt": "2023-05-18T09:30:20Z"
    },
    {
      "id": "8a9b0c1d-2e3f-4g5h-6i7j-8k9l0m1n2o3p",
      "userId": "bb0e8400-e29b-41d4-a716-446655440000",
      "userName": "Sarah M.",
      "rating": 4,
      "comment": "Great product but battery life could be better.",
      "createdAt": "2023-05-17T14:25:10Z"
    }
  ],
  "pagination": {
    "total": 210,
    "pages": 21,
    "currentPage": 1,
    "limit": 10
  },
  "averageRating": 4.5
}
```

**Status Codes:**
- 200: Success
- 404: Product not found

### Create Product Review

```
POST /api/products/:productId/reviews
```

**Description:** Adds a new review for a product.

**Authentication:** Required

**Path Parameters:**
- productId: The UUID of the product to review

**Request Body:**
```json
{
  "rating": 5,
  "comment": "This is an amazing product! The quality is outstanding and it works perfectly."
}
```

**Response Example:**
```json
{
  "id": "9a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p",
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "cc0e8400-e29b-41d4-a716-446655440000",
  "userName": "Michael J.",
  "rating": 5,
  "comment": "This is an amazing product! The quality is outstanding and it works perfectly.",
  "createdAt": "2023-06-02T11:45:30Z"
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request - Invalid input or user already reviewed this product
- 401: Unauthorized
- 404: Product not found

### Update Product Review

```
PUT /api/products/:productId/reviews/:reviewId
```

**Description:** Updates an existing review.

**Authentication:** Required (must be the review author)

**Path Parameters:**
- productId: The UUID of the product
- reviewId: The UUID of the review to update

**Request Body:**
```json
{
  "rating": 4,
  "comment": "After using it for a while, I still like it but found some minor issues."
}
```

**Response Example:**
```json
{
  "id": "9a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p",
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "cc0e8400-e29b-41d4-a716-446655440000",
  "userName": "Michael J.",
  "rating": 4,
  "comment": "After using it for a while, I still like it but found some minor issues.",
  "updatedAt": "2023-06-10T16:20:45Z"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request - Invalid input
- 401: Unauthorized
- 403: Forbidden - Not the review author
- 404: Review or product not found

### Delete Product Review

```
DELETE /api/products/:productId/reviews/:reviewId
```

**Description:** Removes a review.

**Authentication:** Required (must be the review author or admin)

**Path Parameters:**
- productId: The UUID of the product
- reviewId: The UUID of the review to delete

**Response Example:**
```json
{
  "message": "Review successfully deleted",
  "id": "9a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden - Not the review author or admin
- 404: Review or product not found

## Error Responses

All endpoints may return the following error responses:

**Validation Error:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
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