# Hướng dẫn cấu hình Keycloak

Tài liệu này hướng dẫn chi tiết cách cấu hình Keycloak để sử dụng với hệ thống shop microservices.

## 1. Khởi động Keycloak

Sau khi chạy lệnh `docker-compose up -d`, Keycloak sẽ chạy tại địa chỉ http://localhost:8080. Đăng nhập với tài khoản:
- Username: admin
- Password: admin

## 2. Tạo Realm

1. Sau khi đăng nhập, click vào dropdown "master" ở góc trái và chọn "Create Realm"
2. Nhập tên realm: `shop-realm`
3. Click "Create"

## 3. Tạo Client

1. Trong realm mới tạo, chọn menu "Clients" ở sidebar bên trái
2. Click "Create client"
3. Điền thông tin:
   - Client ID: `api-gateway`
   - Client Type: OpenID Connect
4. Click "Next"
5. Cấu hình client:
   - Client authentication: ON (để sử dụng client secret)
   - Authorization: OFF
6. Click "Next" và "Save"
7. Trong tab "Settings" của client vừa tạo, cấu hình:
   - Access Type: confidential
   - Valid Redirect URIs: http://localhost:8000/*
   - Web Origins: * (hoặc http://localhost:8000)
8. Click "Save"

## 4. Lấy Client Secret

1. Chuyển đến tab "Credentials" của client vừa tạo
2. Copy giá trị Client Secret và cập nhật vào biến môi trường `KEYCLOAK_CLIENT_SECRET` trong docker-compose.yml

## 5. Tạo Roles

1. Chọn menu "Realm roles" ở sidebar
2. Click "Create role"
3. Nhập tên: `user`
4. Click "Save"
5. Lặp lại và tạo thêm role `admin` (nếu cần)

## 6. Tạo User

1. Chọn menu "Users" ở sidebar
2. Click "Add user"
3. Điền thông tin:
   - Username: email của người dùng (ví dụ: user@example.com)
   - Email: cùng giá trị với Username
   - First name: Tên người dùng
   - Last name: Họ người dùng
   - Email Verified: ON
4. Click "Create"
5. Chuyển đến tab "Credentials" của user vừa tạo
6. Click "Set password"
7. Nhập password và tắt tùy chọn "Temporary" nếu không muốn yêu cầu đổi mật khẩu
8. Click "Save"
9. Chuyển đến tab "Role mapping"
10. Click "Assign role" và gán role `user` cho người dùng

## 7. Cấu hình cho User Service (nếu cần)

1. Tạo thêm một client có tên `user-service` theo các bước tương tự như client `api-gateway`
2. Đảm bảo rằng Client Secret của client này được cập nhật vào biến môi trường `KEYCLOAK_CLIENT_SECRET` trong service tương ứng

## 8. Kiểm tra Keycloak Authentication

1. Gọi API đăng nhập để kiểm tra:
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

2. Nếu thành công, bạn sẽ nhận được JSON response chứa access_token và refresh_token

## 9. Xử lý sự cố

### Lỗi kết nối từ API Gateway đến Keycloak

Kiểm tra các biến môi trường trong docker-compose.yml:
- KEYCLOAK_URL: http://keycloak:8080
- KEYCLOAK_REALM: shop-realm
- KEYCLOAK_CLIENT_ID: api-gateway
- KEYCLOAK_CLIENT_SECRET: (client secret lấy từ tab Credentials)

### Lỗi không thể đăng nhập

1. Kiểm tra xem user đã được tạo và kích hoạt trong Keycloak
2. Kiểm tra xem user đã được gán role phù hợp
3. Đảm bảo email và password nhập đúng
4. Kiểm tra logs của Keycloak: `docker-compose logs keycloak`
5. Sử dụng API điểm kiểm tra: `GET http://localhost:8000/api/auth/check-keycloak`

### Lỗi không thể lấy thông tin người dùng

1. Đảm bảo token có hiệu lực
2. Kiểm tra header Authorization có đúng format: `Bearer {access_token}`
3. Thử endpoint dự phòng: `GET http://localhost:8000/api/auth/user-details`

## 10. Chi tiết về Keycloak APIs

### Các endpoints chính của Keycloak OpenID Connect

- Authorization URL: http://localhost:8080/realms/shop-realm/protocol/openid-connect/auth
- Token URL: http://localhost:8080/realms/shop-realm/protocol/openid-connect/token
- Userinfo URL: http://localhost:8080/realms/shop-realm/protocol/openid-connect/userinfo
- Logout URL: http://localhost:8080/realms/shop-realm/protocol/openid-connect/logout
- JWKS URL: http://localhost:8080/realms/shop-realm/protocol/openid-connect/certs

### Các endpoints Admin API

- Users API: http://localhost:8080/admin/realms/shop-realm/users
- Roles API: http://localhost:8080/admin/realms/shop-realm/roles 