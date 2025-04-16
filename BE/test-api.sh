#!/bin/bash

# Kiểm tra xem jq đã được cài đặt hay chưa
if ! command -v jq &> /dev/null; then
    echo "Cần cài đặt công cụ jq để chạy test. Vui lòng cài đặt:"
    echo "  - Ubuntu/Debian: sudo apt install jq"
    echo "  - MacOS: brew install jq"
    echo "  - Windows: choco install jq"
    exit 1
fi

# Biến đường dẫn API
API_GATEWAY="http://localhost:8000/api"
USER_SERVICE="http://localhost:3001/api"
PRODUCT_SERVICE="http://localhost:3002/api"
ORDER_SERVICE="http://localhost:3003/api"
CART_SERVICE="http://localhost:3004/api"

# Lưu trữ token
TOKEN_FILE=".token.tmp"

echo "=== Test Shop Microservices APIs ==="
echo ""

# Đăng nhập để lấy token
echo "1. Đăng nhập để lấy token..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

# Kiểm tra có lỗi không
if echo "$LOGIN_RESPONSE" | grep -q "error"; then
  echo "Đăng nhập thất bại:"
  echo $LOGIN_RESPONSE | jq
  exit 1
else
  # Lưu token
  echo $LOGIN_RESPONSE | jq -r '.access_token' > $TOKEN_FILE
  TOKEN=$(cat $TOKEN_FILE)
  echo "Đăng nhập thành công, đã lưu token."
  echo ""
fi

# Lấy thông tin người dùng
echo "2. Lấy thông tin người dùng..."
curl -s -X GET ${API_GATEWAY}/auth/userinfo \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Lấy danh sách sản phẩm
echo "3. Lấy danh sách sản phẩm..."
curl -s -X GET ${PRODUCT_SERVICE}/products | jq
echo ""

# Tạo sản phẩm mới (cần quyền admin)
echo "4. Tạo sản phẩm mới (test với quyền thường, nên sẽ bị từ chối)..."
curl -s -X POST ${PRODUCT_SERVICE}/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Sản phẩm Test",
    "description":"Mô tả sản phẩm test",
    "price":1000,
    "stock":100
  }' | jq
echo ""

# Thêm sản phẩm vào giỏ hàng (giả sử có sản phẩm với ID product-1)
echo "5. Thêm sản phẩm vào giỏ hàng..."
curl -s -X POST ${CART_SERVICE}/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"product-1",
    "quantity":2
  }' | jq
echo ""

# Xem giỏ hàng
echo "6. Xem giỏ hàng hiện tại..."
curl -s -X GET ${CART_SERVICE}/cart \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Xem giỏ hàng từ API Gateway
echo "7. Xem giỏ hàng qua API Gateway..."
curl -s -X GET ${API_GATEWAY}/cart \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Tạo đơn hàng (có thể thất bại do cần địa chỉ giao hàng)
echo "8. Tạo đơn hàng mới..."
curl -s -X POST ${ORDER_SERVICE}/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"productId":"product-1","quantity":1}],
    "shippingAddress":{
      "fullName":"Người Dùng Test",
      "phone":"0123456789",
      "address":"123 Đường Test",
      "city":"TP Test",
      "postalCode":"100000",
      "country":"Việt Nam"
    },
    "paymentMethod":"cod"
  }' | jq
echo ""

# Xem danh sách đơn hàng
echo "9. Xem danh sách đơn hàng của người dùng..."
curl -s -X GET ${ORDER_SERVICE}/orders \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== Kết thúc test ==="
echo "Các lỗi xuất hiện có thể do chưa có dữ liệu hoặc quyền không đủ."
echo "Xóa file token tạm..."
rm -f $TOKEN_FILE 