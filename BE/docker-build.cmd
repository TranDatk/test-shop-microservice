@echo off
echo Building Docker images for Shop Microservices...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Build các image
echo Building images...
docker-compose build

REM Start containers
echo Starting containers...
docker-compose up -d

echo.
echo Services started successfully! You can access:
echo - API Gateway: http://localhost:8000
echo - Keycloak: http://localhost:8080
echo - RabbitMQ Management: http://localhost:15672 (guest/guest)
echo - Consul Dashboard: http://localhost:8500
echo.
echo Run 'docker-compose logs -f' to view logs
echo Run 'docker-compose down' to stop all services 