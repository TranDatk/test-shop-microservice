# Tài liệu API cho Shop Microservices

## API Dịch vụ Người dùng (User Service)

Tài liệu này mô tả các endpoint có sẵn cho Dịch vụ Người dùng trong hệ thống Shop Microservices.

### URL cơ sở

```
http://localhost:8000/api/users
```

### Xác thực

Tất cả các endpoint trừ các endpoint công khai đều yêu cầu xác thực. Đính kèm token JWT vào header của request:

```
Authorization: Bearer <access_token>
```

Bạn có thể lấy access token bằng cách xác thực thông qua các endpoint Auth (xem README.md).

### Các Endpoint

#### Lấy Thông tin Hồ sơ Người dùng Hiện tại
```
GET /api/users/profile
```

**Mô tả:** Lấy thông tin hồ sơ của người dùng đã xác thực hiện tại.

**Xác thực:** Bắt buộc

**Ví dụ Phản hồi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"],
  "createdAt": "2023-05-15T10:30:45Z",
  "updatedAt": "2023-05-15T10:30:45Z"
}
```

**Mã Trạng thái:**
- 200: Thành công
- 401: Không được phép
- 404: Không tìm thấy người dùng

#### Cập nhật Hồ sơ Người dùng
```
PUT /api/users/profile
```

**Mô tả:** Cập nhật thông tin hồ sơ của người dùng đã xác thực hiện tại.

**Xác thực:** Bắt buộc

**Body của Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "123-456-7890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Ví dụ Phản hồi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "123-456-7890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "updatedAt": "2023-05-16T14:22:10Z"
}
```

**Mã Trạng thái:**
- 200: Thành công
- 400: Yêu cầu không hợp lệ - Dữ liệu đầu vào không hợp lệ
- 401: Không được phép
- 404: Không tìm thấy người dùng

#### Lấy Người dùng theo ID (Chỉ Admin)
```
GET /api/users/:userId
```

**Mô tả:** Lấy thông tin của người dùng theo ID. Chỉ người dùng admin mới có thể truy cập.

**Xác thực:** Bắt buộc (vai trò Admin)

**Tham số Đường dẫn:**
- userId: UUID của người dùng cần lấy

**Ví dụ Phản hồi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"],
  "createdAt": "2023-05-15T10:30:45Z",
  "updatedAt": "2023-05-15T10:30:45Z",
  "status": "active"
}
```

**Mã Trạng thái:**
- 200: Thành công
- 401: Không được phép
- 403: Bị cấm - Không phải admin
- 404: Không tìm thấy người dùng

#### Danh sách Người dùng (Chỉ Admin)
```
GET /api/users
```

**Mô tả:** Liệt kê tất cả người dùng trong hệ thống. Chỉ người dùng admin mới có thể truy cập.

**Xác thực:** Bắt buộc (vai trò Admin)

**Tham số Truy vấn:**
- page: Số trang (mặc định: 1)
- limit: Số người dùng mỗi trang (mặc định: 10)
- search: Từ khóa tìm kiếm để lọc theo tên hoặc email
- role: Lọc theo vai trò người dùng
- sortBy: Trường để sắp xếp (mặc định: createdAt)
- sortOrder: Thứ tự sắp xếp (asc hoặc desc, mặc định: desc)

**Ví dụ Phản hồi:**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["user"],
      "createdAt": "2023-05-15T10:30:45Z",
      "status": "active"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "roles": ["user", "admin"],
      "createdAt": "2023-05-14T08:15:22Z",
      "status": "active"
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

**Mã Trạng thái:**
- 200: Thành công
- 401: Không được phép
- 403: Bị cấm - Không phải admin

#### Tạo Người dùng (Chỉ Admin)
```
POST /api/users
```

**Mô tả:** Tạo người dùng mới. Chỉ người dùng admin mới có thể truy cập.

**Xác thực:** Bắt buộc (vai trò Admin)

**Body của Request:**
```json
{
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "password": "securePassword123",
  "roles": ["user"]
}
```

**Ví dụ Phản hồi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "roles": ["user"],
  "createdAt": "2023-05-16T15:40:12Z",
  "status": "active"
}
```

**Mã Trạng thái:**
- 201: Đã tạo
- 400: Yêu cầu không hợp lệ - Dữ liệu đầu vào không hợp lệ hoặc email đã tồn tại
- 401: Không được phép
- 403: Bị cấm - Không phải admin

#### Cập nhật Người dùng (Chỉ Admin)
```
PUT /api/users/:userId
```

**Mô tả:** Cập nhật thông tin của người dùng. Chỉ người dùng admin mới có thể truy cập.

**Xác thực:** Bắt buộc (vai trò Admin)

**Tham số Đường dẫn:**
- userId: UUID của người dùng cần cập nhật

**Body của Request:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "roles": ["user", "admin"],
  "status": "inactive"
}
```

**Ví dụ Phản hồi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "Updated",
  "lastName": "Name",
  "roles": ["user", "admin"],
  "status": "inactive",
  "updatedAt": "2023-05-16T16:05:30Z"
}
```

**Mã Trạng thái:**
- 200: Thành công
- 400: Yêu cầu không hợp lệ - Dữ liệu đầu vào không hợp lệ
- 401: Không được phép
- 403: Bị cấm - Không phải admin
- 404: Không tìm thấy người dùng

#### Xóa Người dùng (Chỉ Admin)
```
DELETE /api/users/:userId
```

**Mô tả:** Xóa người dùng khỏi hệ thống. Chỉ người dùng admin mới có thể truy cập.

**Xác thực:** Bắt buộc (vai trò Admin)

**Tham số Đường dẫn:**
- userId: UUID của người dùng cần xóa

**Ví dụ Phản hồi:**
```json
{
  "message": "Xóa người dùng thành công",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Mã Trạng thái:**
- 200: Thành công
- 401: Không được phép
- 403: Bị cấm - Không phải admin
- 404: Không tìm thấy người dùng

## Phản hồi Lỗi

Tất cả các endpoint có thể trả về các phản hồi lỗi sau:

**Lỗi Xác thực:**
```json
{
  "error": "Lỗi Xác thực",
  "message": "Dữ liệu đầu vào không hợp lệ",
  "details": [
    {
      "field": "email",
      "message": "Phải là địa chỉ email hợp lệ"
    }
  ]
}
```

**Lỗi Máy chủ:**
```json
{
  "error": "Lỗi Máy chủ Nội bộ",
  "message": "Đã xảy ra lỗi không mong muốn"
}
```

**Lỗi Xác thực:**
```json
{
  "error": "Lỗi Xác thực",
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

**Lỗi Ủy quyền:**
```json
{
  "error": "Lỗi Ủy quyền",
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
``` 