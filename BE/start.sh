#!/bin/bash

# Khởi động các dịch vụ
echo "Starting services..."
docker-compose up -d

# Đợi Keycloak khởi động
echo "Waiting for Keycloak to start..."
sleep 30

# Tạo Realm và Client trong Keycloak
echo "Configuring Keycloak..."

# Tạo Realm
echo "Creating Realm..."
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create realms -s realm=shop-realm -s enabled=true

# Tạo Client cho API Gateway
echo "Creating API Gateway client..."
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create clients -r shop-realm -s clientId=api-gateway -s publicClient=false -s secret=LKfwFVt3TvEP7Egd5szY83RbfQ7DDPQN -s redirectUris='["http://localhost:8000/*"]' -s webOrigins='["*"]' -s directAccessGrantsEnabled=true -s serviceAccountsEnabled=true

# Tạo Client cho User Service
echo "Creating User Service client..."
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create clients -r shop-realm -s clientId=user-service -s publicClient=false -s secret=LKfwFVt3TvEP7Egd5szY83RbfQ7DDPQN -s serviceAccountsEnabled=true

# Tạo Roles
echo "Creating roles..."
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create roles -r shop-realm -s name=admin
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create roles -r shop-realm -s name=user

# Tạo User mẫu
echo "Creating test users..."
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create users -r shop-realm -s username=test@example.com -s email=test@example.com -s firstName=Test -s lastName=User -s enabled=true
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh set-password -r shop-realm --username test@example.com --new-password password123
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh add-roles -r shop-realm --uusername test@example.com --rolename user

# Tạo User admin
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh create users -r shop-realm -s username=admin@example.com -s email=admin@example.com -s firstName=Admin -s lastName=User -s enabled=true
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh set-password -r shop-realm --username admin@example.com --new-password admin
docker exec -it keycloak /opt/keycloak/bin/kcadm.sh add-roles -r shop-realm --uusername admin@example.com --rolename admin

echo "Setup complete. You can access Keycloak Admin Console at http://localhost:8080"
echo "API Gateway is available at http://localhost:8000"
echo "Test user: test@example.com / password123"
echo "Admin user: admin@example.com / admin"