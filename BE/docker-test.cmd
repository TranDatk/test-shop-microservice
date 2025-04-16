@echo off
echo Running tests for Shop Microservices...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Dừng và xóa các container test cũ nếu có
echo Stopping and removing old test containers...
docker-compose -f docker-compose.test.yml down

REM Khởi động các container test
echo Starting test containers...
docker-compose -f docker-compose.test.yml up -d

REM Đợi để đảm bảo các service đã khởi động
echo Waiting for services to start...
timeout /t 10 /nobreak

REM Chạy test cho User Service
echo Running tests for User Service...
docker exec user-service-test npm test

REM Chạy test cho Product Service
echo Running tests for Product Service...
docker exec product-service-test npm test

REM Chạy test cho Order Service
echo Running tests for Order Service...
docker exec order-service-test npm test

REM Chạy test cho Cart Service
echo Running tests for Cart Service...
docker exec cart-service-test npm test

REM Dừng các container test
echo Stopping test containers...
docker-compose -f docker-compose.test.yml down

echo.
echo Tests completed! 