#!/bin/bash

# Chạy các test cho từng service

echo "=== Chạy test cho Shop Microservices ==="

# Kiểm tra xem đã cài đặt Docker và Docker Compose chưa
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Cần cài đặt Docker và Docker Compose để chạy test."
    echo "Bạn có thể chạy test thủ công bằng cách:"
    echo "  cd <service-directory> && npm test"
    exit 1
fi

# Dừng và xóa các container test cũ nếu có
echo "Dừng và xóa các container test cũ..."
docker-compose -f docker-compose.test.yml down

# Khởi động các container test
echo "Khởi động các container test..."
docker-compose -f docker-compose.test.yml up -d

# Đợi để đảm bảo các service đã khởi động
echo "Đợi các service khởi động..."
sleep 10

# Chạy test cho User Service
echo "Chạy test cho User Service..."
docker exec -it user-service-test npm test

# Chạy test cho Product Service
echo "Chạy test cho Product Service..."
docker exec -it product-service-test npm test

# Chạy test cho Order Service
echo "Chạy test cho Order Service..."
docker exec -it order-service-test npm test

# Chạy test cho Cart Service
echo "Chạy test cho Cart Service..."
docker exec -it cart-service-test npm test

# Dừng các container test
echo "Dừng các container test..."
docker-compose -f docker-compose.test.yml down

echo "=== Test hoàn tất ===" 