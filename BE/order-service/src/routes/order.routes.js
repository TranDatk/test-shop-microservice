const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Routes cho người dùng đã xác thực
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderById);
router.post('/', authMiddleware, orderController.createOrder);
router.patch('/:orderId/cancel', authMiddleware, orderController.cancelOrder);

// Webhook thanh toán (cần xác thực đặc biệt trong controller)
router.post('/payment-webhook', orderController.processPaymentWebhook);

// Routes cho admin
router.get('/admin/orders', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.patch('/admin/orders/:orderId/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.post('/admin/orders/:orderId/refund', authMiddleware, adminMiddleware, orderController.issueRefund);
router.get('/admin/orders/reports', authMiddleware, adminMiddleware, orderController.generateOrderReport);

module.exports = router; 