# Shop Microservices

Dự án này là một ứng dụng web thương mại điện tử được xây dựng với kiến trúc microservices, cung cấp các tính năng cơ bản cho một cửa hàng trực tuyến.

## Tổng quan

Hệ thống gồm các microservice riêng biệt, mỗi service phụ trách một phần chức năng của ứng dụng:

- **API Gateway**: Điểm truy cập duy nhất cho tất cả các microservice
- **User Service**: Quản lý người dùng và xác thực
- **Product Service**: Quản lý sản phẩm và danh mục
- **Order Service**: Quản lý đơn hàng và thanh toán
- **Cart Service**: Quản lý giỏ hàng và phiên người dùng

## Công nghệ sử dụng

- **Node.js**: Nền tảng chạy JavaScript ở phía server
- **Express.js**: Framework web để xây dựng API
- **PostgreSQL**: Cơ sở dữ liệu chính cho User, Product và Order Service
- **Redis**: Cơ sở dữ liệu cho Cart Service, cache và phiên làm việc
- **RabbitMQ**: Message broker cho giao tiếp giữa các service
- **JWT**: Xác thực và ủy quyền người dùng
- **Docker**: Đóng gói và triển khai các service

## Cài đặt và chạy

### Yêu cầu

- Node.js v14+ 
- Docker và Docker Compose
- PostgreSQL
- Redis
- RabbitMQ

### Thiết lập môi trường

1. Clone repository
   ```bash
   git clone https://github.com/yourusername/shop-microservices.git
   cd shop-microservices
   ```

2. Tạo file biến môi trường
   ```bash
   cp .env.example .env
   ```

3. Chỉnh sửa file `.env` với các thông tin cấu hình cần thiết

### Chạy với Docker

```bash
docker-compose up -d
```

### Chạy từng service riêng lẻ

1. Cài đặt các dependency
   ```bash
   cd api-gateway && npm install
   cd ../user-service && npm install
   cd ../product-service && npm install
   cd ../order-service && npm install
   cd ../cart-service && npm install
   ```

2. Chạy từng service
   ```bash
   # Terminal 1
   cd api-gateway && npm run dev
   
   # Terminal 2
   cd user-service && npm run dev
   
   # Terminal 3
   cd product-service && npm run dev
   
   # Terminal 4
   cd order-service && npm run dev
   
   # Terminal 5
   cd cart-service && npm run dev
   ```

## API Endpoints

Chi tiết API được mô tả trong các file sau:
- [User Service API](API_DOCUMENTATION.md)
- [Product Service API](PRODUCT_SERVICE_API.md)
- [Order Service API](ORDER_SERVICE_API.md)

## Cấu trúc dự án

```
shop-microservices/
├── api-gateway/            # API Gateway
├── user-service/           # User Service
├── product-service/        # Product Service
├── order-service/          # Order Service
├── cart-service/           # Cart Service
├── shared/                 # Thư viện và tiện ích dùng chung
├── docker-compose.yml      # Cấu hình Docker Compose
├── .env                    # Biến môi trường
└── README.md               # Tài liệu dự án
```

## Kiến trúc hệ thống

```
┌───────────────┐       ┌─────────────┐
│    Client     │──────▶│ API Gateway │
└───────────────┘       └──────┬──────┘
                               │
   ┌───────────────────────────┼───────────────────────────┐
   │                           │                           │
┌──▼─────────┐          ┌──────▼──────┐             ┌──────▼──────┐
│User Service│◀────────▶│Product Service│◀─────────▶│Order Service│
└─────┬──────┘          └──────┬───────┘             └──────┬──────┘
      │                        │                            │
      │                        │                            │
      │                 ┌──────▼──────┐                     │
      └────────────────▶│Cart Service │◀───────────────────┘
                        └─────────────┘
```

## Phát triển

1. Fork repository
2. Tạo một nhánh feature mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Tạo một Pull Request

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua email: dat.tran@example.com 