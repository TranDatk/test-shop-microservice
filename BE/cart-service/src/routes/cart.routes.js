const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Tất cả các routes đều yêu cầu xác thực
router.use(authMiddleware);

// Routes cho giỏ hàng
router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

// Routes cho mã giảm giá
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

// Kiểm tra giỏ hàng trước khi đặt hàng
router.get('/validate', cartController.validateCart);

module.exports = router; 