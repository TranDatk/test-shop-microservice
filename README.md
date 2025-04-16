# Shop Microservice

A full-stack e-commerce application built with a microservice architecture.

## Project Structure

This project contains both backend (microservices) and frontend (web application) components.

## Backend

The backend consists of several microservices:

- **Auth Service**: Handles user authentication and authorization
- **Product Service**: Manages product data and inventory
- **Order Service**: Processes and tracks customer orders
- **Payment Service**: Handles payment processing
- **User Service**: Manages user profiles and preferences

### Technologies Used

- Node.js
- Express
- MongoDB
- Docker
- Kubernetes (optional for deployment)
- JWT for authentication

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example` files in each service)
4. Start the services:
   ```
   npm run dev
   ```

## Frontend

The frontend is a modern web application for customers to browse products and place orders.

### Technologies Used

- React.js
- Next.js
- Redux for state management
- Tailwind CSS for styling
- Axios for API requests

### Getting Started

1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local instance or cloud)

### Environment Setup

Create `.env` files in both frontend and backend directories based on the provided examples.

## Deployment

Instructions for deploying both backend and frontend components to your preferred hosting service.

## Testing

```
npm test
```

## Contributing

Guidelines for contributing to the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
