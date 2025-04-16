const Order = require('../models/order.model');
const { v4: uuidv4 } = require('uuid');
const messageBroker = require('../utils/message-broker');
const axios = require('axios');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      couponCode
    } = req.body;
    
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({
        message: 'Dữ liệu đơn hàng không hợp lệ',
        details: [
          !items || !items.length ? { field: 'items', message: 'Đơn hàng phải có ít nhất một sản phẩm' } : null,
          !shippingAddress ? { field: 'shippingAddress', message: 'Địa chỉ giao hàng là bắt buộc' } : null
        ].filter(Boolean)
      });
    }
    
    // Get product details for each item
    const orderItems = [];
    let subtotal = 0;
    
    for (const item of items) {
      try {
        // Fetch product details from product service
        const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        const product = response.data;
        
        // Check if product exists and has enough stock
        if (!product) {
          return res.status(404).json({
            message: 'Sản phẩm không tồn tại',
            details: [{ field: 'productId', message: `Sản phẩm với ID ${item.productId} không tồn tại` }]
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: 'Số lượng sản phẩm không đủ',
            details: [{ 
              field: 'quantity', 
              message: `Chỉ còn ${product.stock} sản phẩm "${product.name}" trong kho`
            }]
          });
        }
        
        // Calculate item subtotal
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;
        
        // Add item to order
        orderItems.push({
          item_id: uuidv4(),
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: item.quantity,
          image_url: product.image_url,
          subtotal: itemSubtotal
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm' });
      }
    }
    
    // Calculate order totals
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping for orders over 1000
    
    // Apply coupon if provided
    let discount = 0;
    let couponApplied = null;
    
    if (couponCode) {
      try {
        // In a real application, this would call a coupon service
        // Here we're just simulating basic coupon functionality
        if (couponCode === 'WELCOME10') {
          discount = Math.round(subtotal * 0.1 * 100) / 100; // 10% discount
          couponApplied = {
            code: couponCode,
            discount,
            type: 'percentage',
            value: 10
          };
        } else if (couponCode === 'FREESHIP') {
          discount = shippingCost;
          couponApplied = {
            code: couponCode,
            discount,
            type: 'shipping',
            value: 'free'
          };
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
        // Continue without applying coupon
      }
    }
    
    // Calculate total amount
    const totalAmount = subtotal + tax + shippingCost - discount;
    
    // Generate order ID
    const orderId = uuidv4();
    
    // Create order
    const newOrder = await Order.createOrder({
      order_id: orderId,
      user_id: userId,
      total_amount: totalAmount,
      subtotal,
      tax,
      shipping_cost: shippingCost,
      discount,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress,
      notes,
      coupon_code: couponCode,
      coupon_applied: couponApplied,
      items: orderItems
    });
    
    // Update product stock
    for (const item of orderItems) {
      try {
        // Call product service to update stock
        await axios.patch(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
          { 
            stock: product.stock - item.quantity 
          },
          {
            headers: {
              Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            }
          }
        );
      } catch (error) {
        console.error('Error updating product stock:', error);
        // Continue processing, we'll handle this asynchronously
      }
    }
    
    // Publish order created event
    await messageBroker.publishMessage(
      'order_events',
      'order.created',
      {
        order_id: newOrder.order_id,
        user_id: newOrder.user_id,
        total_amount: newOrder.total_amount,
        items: newOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      }
    );
    
    // Add payment URL if payment method is not cash on delivery
    if (paymentMethod !== 'cod') {
      newOrder.paymentUrl = `${process.env.PAYMENT_GATEWAY_URL}/pay/${orderId}`;
      newOrder.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
    
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách đơn hàng của người dùng hiện tại
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page, limit, status, sortBy, sortOrder } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await Order.findOrdersByUserId(userId, options);
    res.json(result);
  } catch (err) {
    console.error('Error getting user orders:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user_id;
    
    const order = await Order.findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if user is the owner of the order or an admin
    if (order.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error getting order by id:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.user_id;
    
    // Get the order
    const order = await Order.findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if user is the owner of the order
    if (order.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Không thể hủy đơn hàng', 
        details: [{ 
          field: 'status', 
          message: 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý hoặc đang xử lý'
        }]
      });
    }
    
    // Cancel order
    const result = await Order.cancelOrder(orderId, reason || 'Khách hàng hủy đơn hàng');
    
    // Restore product stock
    for (const item of order.items) {
      try {
        // First get current stock
        const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
        const product = productResponse.data;
        
        // Then update stock
        await axios.patch(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
          { 
            stock: product.stock + item.quantity
          },
          {
            headers: {
              Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            }
          }
        );
      } catch (error) {
        console.error('Error restoring product stock:', error);
        // Continue processing, handle this asynchronously
      }
    }
    
    // Publish order cancelled event
    await messageBroker.publishMessage(
      'order_events',
      'order.cancelled',
      {
        order_id: orderId,
        user_id: order.user_id,
        reason
      }
    );
    
    res.json({
      ...result,
      message: 'Đơn hàng đã được hủy thành công'
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Webhook nhận thông báo thanh toán
exports.processPaymentWebhook = async (req, res) => {
  try {
    // Verify webhook signature (would use a proper validation in production)
    const signature = req.headers['x-payment-signature'];
    if (!signature) {
      return res.status(401).json({ message: 'Chữ ký không hợp lệ' });
    }
    
    const {
      event,
      orderId,
      transactionId,
      amount,
      paymentMethod,
      metadata
    } = req.body;
    
    // Get the order
    const order = await Order.findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if payment is already processed
    if (order.payment_status === 'paid') {
      return res.status(409).json({ message: 'Thanh toán đã được xử lý trước đó' });
    }
    
    // Process based on event type
    let paymentStatus;
    if (event === 'payment.succeeded') {
      paymentStatus = 'paid';
    } else if (event === 'payment.failed') {
      paymentStatus = 'failed';
    } else {
      return res.status(400).json({ message: 'Sự kiện không được hỗ trợ' });
    }
    
    // Update order payment
    const result = await Order.updateOrderPayment(orderId, {
      payment_status: paymentStatus,
      transaction_id: transactionId,
      payment_details: {
        amount,
        currency: 'VND',
        payment_method: paymentMethod,
        ...metadata
      }
    });
    
    // Publish payment event
    await messageBroker.publishMessage(
      'order_events',
      `order.payment_${paymentStatus}`,
      {
        order_id: orderId,
        transaction_id: transactionId,
        amount
      }
    );
    
    res.json({
      success: true,
      message: 'Trạng thái thanh toán đã được cập nhật thành công',
      orderId,
      newStatus: order.status
    });
  } catch (err) {
    console.error('Error processing payment webhook:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// === Admin Endpoints ===

// Lấy danh sách tất cả đơn hàng (chỉ Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page,
      limit,
      userId,
      status,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder
    } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      userId,
      status,
      paymentStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    };
    
    const result = await Order.findAllOrders(options);
    res.json(result);
  } catch (err) {
    console.error('Error getting all orders:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái đơn hàng (chỉ Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, carrier, note } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Trạng thái đơn hàng không hợp lệ',
        details: [{
          field: 'status',
          message: `Trạng thái phải là một trong các giá trị: ${validStatuses.join(', ')}`
        }]
      });
    }
    
    // Get the order
    const order = await Order.findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check for valid status transitions
    if (status === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        message: 'Không thể hủy đơn hàng đã giao hoặc đang giao',
        details: [{
          field: 'status',
          message: 'Đơn hàng đã được giao hoặc đang được giao, không thể hủy'
        }]
      });
    }
    
    // Update tracking information if provided
    if (trackingNumber && carrier) {
      await Order.updateShippingDetails(orderId, { tracking_number: trackingNumber, carrier });
    }
    
    // Update order status
    const result = await Order.updateOrderStatus(orderId, status, note || `Đơn hàng đã được cập nhật sang trạng thái ${status}`);
    
    // If order is cancelled, restore product stock
    if (status === 'cancelled') {
      for (const item of order.items) {
        try {
          // First get current stock
          const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
          const product = productResponse.data;
          
          // Then update stock
          await axios.patch(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
            { 
              stock: product.stock + item.quantity
            },
            {
              headers: {
                Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
              }
            }
          );
        } catch (error) {
          console.error('Error restoring product stock:', error);
          // Continue processing
        }
      }
    }
    
    // Publish order status updated event
    await messageBroker.publishMessage(
      'order_events',
      'order.status_updated',
      {
        order_id: orderId,
        previous_status: order.status,
        new_status: status,
        tracking_number: trackingNumber,
        carrier
      }
    );
    
    res.json({
      ...result,
      message: 'Trạng thái đơn hàng đã được cập nhật thành công'
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hoàn tiền đơn hàng (chỉ Admin)
exports.issueRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason, refundToOriginalPaymentMethod } = req.body;
    
    // Get the order
    const order = await Order.findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || parseFloat(amount) > order.total_amount) {
      return res.status(400).json({
        message: 'Số tiền hoàn trả không hợp lệ',
        details: [{
          field: 'amount',
          message: `Số tiền phải lớn hơn 0 và không vượt quá tổng đơn hàng (${order.total_amount})`
        }]
      });
    }
    
    // Check if order can be refunded
    if (order.payment_status !== 'paid') {
      return res.status(400).json({
        message: 'Không thể hoàn tiền đơn hàng',
        details: [{
          field: 'payment_status',
          message: 'Chỉ có thể hoàn tiền cho đơn hàng đã thanh toán'
        }]
      });
    }
    
    // In a real application, would call payment processor API here
    
    // Issue refund
    const result = await Order.issueRefund(orderId, {
      amount: parseFloat(amount),
      reason
    });
    
    // Restore product stock
    for (const item of order.items) {
      try {
        // First get current stock
        const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
        const product = productResponse.data;
        
        // Then update stock
        await axios.patch(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
          { 
            stock: product.stock + item.quantity
          },
          {
            headers: {
              Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            }
          }
        );
      } catch (error) {
        console.error('Error restoring product stock:', error);
        // Continue processing
      }
    }
    
    // Publish refund event
    await messageBroker.publishMessage(
      'order_events',
      'order.refunded',
      {
        order_id: orderId,
        amount: parseFloat(amount),
        reason
      }
    );
    
    res.json(result);
  } catch (err) {
    console.error('Error issuing refund:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Tạo báo cáo đơn hàng (chỉ Admin)
exports.generateOrderReport = async (req, res) => {
  try {
    const { format, startDate, endDate, status, groupBy } = req.query;
    
    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Thời gian bắt đầu và kết thúc là bắt buộc',
        details: [
          !startDate ? { field: 'startDate', message: 'Thời gian bắt đầu là bắt buộc' } : null,
          !endDate ? { field: 'endDate', message: 'Thời gian kết thúc là bắt buộc' } : null
        ].filter(Boolean)
      });
    }
    
    // Generate report
    const report = await Order.generateOrderReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      groupBy: groupBy || 'daily'
    });
    
    // Format output based on requested format
    if (format === 'csv') {
      // In a real application, would generate CSV here
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=order-report-${report.reportId}.csv`);
      res.send('Date,Orders,Revenue,Tax,Shipping,AverageOrderValue\n');
    } else if (format === 'pdf') {
      // In a real application, would generate PDF here
      res.setHeader('Content-Type', 'application/pdf');
      res.send('PDF content would be here');
    } else {
      // Default to JSON
      res.json(report);
    }
  } catch (err) {
    console.error('Error generating order report:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}; 