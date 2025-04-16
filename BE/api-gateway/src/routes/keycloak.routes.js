const express = require('express');
const axios = require('axios');
const router = express.Router();

// Đăng ký người dùng mới
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    console.log(`Attempting to register user ${email}`);
    
    // Lấy token admin để tạo người dùng
    const adminToken = await getAdminToken();
    
    // Tạo người dùng mới trong Keycloak
    const user = await createKeycloakUser(adminToken, {
      email,
      username: email,
      firstName,
      lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false
        }
      ]
    });
    
    // Gán vai trò 'user' cho người dùng mới
    await assignUserRole(adminToken, user.id, 'user');
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Attempting login for ${email} with Keycloak URL: ${process.env.KEYCLOAK_URL}, Realm: ${process.env.KEYCLOAK_REALM}, Client ID: ${process.env.KEYCLOAK_CLIENT_ID}`);
    
    // Gọi Keycloak để lấy token
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: 'password',
        username: email,
        password: password
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Trả về thông tin token
    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Làm mới token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // Gọi Keycloak để làm mới token
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Trả về thông tin token mới
    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Refresh token error:', error.response?.data || error.message);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Đăng xuất
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // Gọi Keycloak để đăng xuất
    await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        refresh_token: refresh_token
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Lấy thông tin người dùng
router.get('/userinfo', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log(`Attempting to get userinfo with token. Keycloak URL: ${process.env.KEYCLOAK_URL}`);
    
    // Gọi Keycloak để lấy thông tin người dùng
    const userInfoUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
    console.log(`Calling Keycloak userinfo endpoint: ${userInfoUrl}`);
    
    try {
      const response = await axios.get(
        userInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Received user info response:', response.data);
      res.json(response.data);
    } catch (error) {
      console.error('Keycloak userinfo error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      res.status(401).json({ message: 'Failed to get user info' });
    }
  } catch (error) {
    console.error('Userinfo error:', error);
    res.status(401).json({ message: 'Failed to get user info' });
  }
});

// Đổi mật khẩu
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Lấy thông tin người dùng
    const userInfoResponse = await axios.get(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    const userId = userInfoResponse.data.sub;
    
    // Lấy admin token
    const adminToken = await getAdminToken();
    
    // Đổi mật khẩu
    await axios.put(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/reset-password`,
      {
        type: 'password',
        value: newPassword,
        temporary: false
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Route để kiểm tra kết nối Keycloak
router.get('/check-keycloak', async (req, res) => {
  try {
    console.log(`Checking Keycloak connectivity: ${process.env.KEYCLOAK_URL}`);
    
    // Test kết nối đến well-known endpoint
    const wellKnownUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/.well-known/openid-configuration`;
    console.log(`Testing connection to: ${wellKnownUrl}`);
    
    const response = await axios.get(wellKnownUrl);
    
    console.log('Keycloak connection successful:', response.status);
    console.log('Available endpoints:', {
      authorization_endpoint: response.data.authorization_endpoint,
      token_endpoint: response.data.token_endpoint,
      userinfo_endpoint: response.data.userinfo_endpoint
    });
    
    res.json({
      status: 'OK',
      message: 'Keycloak connection successful',
      keycloakUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      userinfo_endpoint: response.data.userinfo_endpoint
    });
  } catch (error) {
    console.error('Keycloak connectivity error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received, network error likely');
    }
    
    res.status(500).json({
      status: 'Error',
      message: `Failed to connect to Keycloak: ${error.message}`,
      keycloakUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM
    });
  }
});

// Lấy thông tin người dùng (phương pháp dự phòng)
router.get('/user-details', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Giải mã token để lấy sub (user id)
    try {
      console.log('Decoding token to extract user info');
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Token payload:', payload);
      
      // Lấy user_id từ payload
      const userId = payload.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in token' });
      }
      
      // Sử dụng Admin API để lấy thông tin chi tiết
      const adminToken = await getAdminToken();
      
      // Lấy thông tin chi tiết của người dùng
      const userResponse = await axios.get(
        `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      // Trả về thông tin người dùng với bớt các trường nhạy cảm
      const userData = userResponse.data;
      
      res.json({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled,
        emailVerified: userData.emailVerified,
        roles: payload.realm_access?.roles || []
      });
    } catch (error) {
      console.error('Error decoding token or fetching user:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      res.status(401).json({ message: 'Failed to get user details' });
    }
  } catch (error) {
    console.error('User details error:', error);
    res.status(401).json({ message: 'Failed to get user details' });
  }
});

// Hàm trợ giúp để lấy token admin
async function getAdminToken() {
  try {
    console.log('Getting admin token from Keycloak');
    console.log(`Admin token URL: ${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`);
    
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: 'admin-cli',
        username: 'admin',
        password: 'admin',
        grant_type: 'password'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Admin token received successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get admin token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received, network error likely');
    }
    throw new Error(`Failed to get admin token: ${error.message}`);
  }
}

// Hàm trợ giúp để tạo người dùng Keycloak
async function createKeycloakUser(adminToken, userData) {
  // Tạo người dùng
  await axios.post(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Tìm người dùng vừa tạo bằng email
  const usersResponse = await axios.get(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${userData.email}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );
  
  return usersResponse.data[0];
}

// Hàm trợ giúp để gán vai trò cho người dùng
async function assignUserRole(adminToken, userId, roleName) {
  // Lấy thông tin role
  const rolesResponse = await axios.get(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );
  
  const role = rolesResponse.data.find(r => r.name === roleName);
  
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }
  
  // Gán role cho người dùng
  await axios.post(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
    [role],
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = router; 