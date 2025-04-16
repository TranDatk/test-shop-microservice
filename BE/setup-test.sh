#!/bin/bash

# Tạo file .env từ .env.example
cp .env.example .env

# Tạo các thư mục cần thiết
mkdir -p logs

# Cài đặt dependencies cho các service
echo "Cài đặt dependencies cho các service..."

# Product Service
cd product-service
npm install
cd ..

# Order Service
cd order-service
npm install
cd ..

# Cart Service
cd cart-service
npm install
cd ..

# API Gateway
cd api-gateway
npm install
cd ..

# User Service
cd user-service
npm install
cd ..

echo "Thiết lập hoàn tất. Bạn có thể chạy dự án với một trong các cách sau:"
echo ""
echo "1. Chạy với Docker Compose (cần cài đặt Docker và Docker Compose):"
echo "   docker-compose up -d"
echo ""
echo "2. Chạy thủ công từng service (cần PostgreSQL, Redis và RabbitMQ đang chạy):"
echo "   cd product-service && npm run dev"
echo "   cd order-service && npm run dev"
echo "   cd cart-service && npm run dev"
echo "   cd user-service && npm run dev"
echo "   cd api-gateway && npm run dev"
echo ""
echo "3. Chạy script khởi động:"
echo "   ./start.sh"
echo ""
echo "API Documentation có sẵn tại:"
echo "- User Service API: http://localhost:3001/api-docs"
echo "- Product Service API: http://localhost:3002/api-docs"
echo "- Order Service API: http://localhost:3003/api-docs"
echo "- Cart Service API: http://localhost:3004/api-docs" 