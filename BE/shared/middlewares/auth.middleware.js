const jwt = require('jsonwebtoken');
const axios = require('axios');

// Cache for service tokens
const tokenCache = {
  token: null,
  expiresAt: null
};

// Authentication middleware
exports.authMiddleware = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Lỗi Xác thực',
        message: 'Không có token xác thực'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Set user info in request object
      req.user = decoded;
      
      // Add additional user info from user service if necessary
      if (process.env.USER_SERVICE_URL && !req.user.role) {
        try {
          const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${req.user.user_id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          req.user = {
            ...req.user,
            ...response.data
          };
        } catch (error) {
          console.error('Error fetching user details:', error);
          // Continue without additional user info
        }
      }
      
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        error: 'Lỗi Xác thực',
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({
      error: 'Lỗi Máy chủ Nội bộ',
      message: 'Đã xảy ra lỗi khi xác thực'
    });
  }
};

// Admin authorization middleware
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Lỗi Ủy quyền',
      message: 'Bạn không có quyền truy cập tài nguyên này'
    });
  }
  
  next();
};

// Get service token for internal service communication
exports.getServiceToken = async () => {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now) {
      return tokenCache.token;
    }
    
    // Get new token from auth service
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/service`, {
      serviceId: process.env.SERVICE_ID,
      serviceSecret: process.env.SERVICE_SECRET
    });
    
    const { token, expiresIn } = response.data;
    
    // Cache the token
    tokenCache.token = token;
    tokenCache.expiresAt = now + expiresIn * 1000 - 60000; // Expire 1 minute before actual expiry
    
    return token;
  } catch (err) {
    console.error('Error getting service token:', err);
    throw err;
  }
}; 