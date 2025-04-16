const db = require('../config/db.config');

class Order {
  static async createTable() {
    const ordersQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
        shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
        discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_details JSONB,
        shipping_address JSONB NOT NULL,
        billing_address JSONB,
        tracking_number VARCHAR(100),
        carrier VARCHAR(100),
        notes TEXT,
        coupon_code VARCHAR(50),
        coupon_applied JSONB,
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const orderItemsQuery = `
      CREATE TABLE IF NOT EXISTS order_items (
        item_id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        image_url TEXT,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const orderStatusHistoryQuery = `
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(order_id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.query(ordersQuery);
      await db.query(orderItemsQuery);
      await db.query(orderStatusHistoryQuery);
      console.log('Order tables created or already exist');
    } catch (err) {
      console.error('Error creating order tables:', err);
      throw err;
    }
  }

  static async createOrder(orderData) {
    const {
      order_id,
      user_id,
      total_amount,
      subtotal,
      tax,
      shipping_cost,
      discount,
      payment_method,
      shipping_address,
      billing_address,
      notes,
      coupon_code,
      coupon_applied,
      items
    } = orderData;
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert order
      const orderQuery = `
        INSERT INTO orders (
          order_id, user_id, total_amount, subtotal, tax, shipping_cost, 
          discount, payment_method, shipping_address, billing_address, 
          notes, coupon_code, coupon_applied
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      
      const orderValues = [
        order_id,
        user_id,
        total_amount,
        subtotal,
        tax || 0,
        shipping_cost || 0,
        discount || 0,
        payment_method,
        JSON.stringify(shipping_address),
        billing_address ? JSON.stringify(billing_address) : null,
        notes,
        coupon_code,
        coupon_applied ? JSON.stringify(coupon_applied) : null
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];
      
      // Insert order items
      const orderItems = [];
      for (const item of items) {
        const { item_id, product_id, name, description, price, quantity, image_url } = item;
        const subtotal = price * quantity;
        
        const itemQuery = `
          INSERT INTO order_items (
            item_id, order_id, product_id, name, description, 
            price, quantity, image_url, subtotal
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        
        const itemValues = [
          item_id,
          order_id,
          product_id,
          name,
          description || null,
          price,
          quantity,
          image_url || null,
          subtotal
        ];
        
        const itemResult = await client.query(itemQuery, itemValues);
        orderItems.push(itemResult.rows[0]);
      }
      
      // Insert initial status history
      const statusQuery = `
        INSERT INTO order_status_history (order_id, status, note)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(statusQuery, [order_id, 'pending', 'Đơn hàng đã được tạo']);
      
      await client.query('COMMIT');
      
      // Format and return the complete order
      return {
        ...order,
        shipping_address: JSON.parse(order.shipping_address),
        billing_address: order.billing_address ? JSON.parse(order.billing_address) : null,
        coupon_applied: order.coupon_applied ? JSON.parse(order.coupon_applied) : null,
        items: orderItems,
        status_history: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Đơn hàng đã được tạo'
        }]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async findOrdersByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    
    // Basic query
    let query = `
      SELECT o.*, 
        (SELECT json_agg(i.*) FROM order_items i WHERE i.order_id = o.order_id) as items
      FROM orders o
      WHERE o.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramIndex = 2;
    
    // Add optional filters
    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    // Add sorting
    const validSortColumns = ['created_at', 'total_amount', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY o.${sortColumn} ${order}`;
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    try {
      const result = await db.query(query, queryParams);
      
      // Count total orders for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders
        WHERE user_id = $1
        ${status ? 'AND status = $2' : ''}
      `;
      
      const countParams = [userId];
      if (status) {
        countParams.push(status);
      }
      
      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Format the orders
      const orders = result.rows.map(order => ({
        ...order,
        shipping_address: JSON.parse(order.shipping_address),
        billing_address: order.billing_address ? JSON.parse(order.billing_address) : null,
        payment_details: order.payment_details ? JSON.parse(order.payment_details) : null,
        coupon_applied: order.coupon_applied ? JSON.parse(order.coupon_applied) : null,
        items: order.items || []
      }));
      
      return {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      };
    } catch (err) {
      console.error('Error finding orders by user ID:', err);
      throw err;
    }
  }

  static async findOrderById(orderId) {
    const orderQuery = `
      SELECT o.*
      FROM orders o
      WHERE o.order_id = $1
    `;
    
    const itemsQuery = `
      SELECT i.*
      FROM order_items i
      WHERE i.order_id = $1
    `;
    
    const historyQuery = `
      SELECT id, status, note, timestamp
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY timestamp ASC
    `;
    
    try {
      const orderResult = await db.query(orderQuery, [orderId]);
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const order = orderResult.rows[0];
      
      // Get items
      const itemsResult = await db.query(itemsQuery, [orderId]);
      
      // Get status history
      const historyResult = await db.query(historyQuery, [orderId]);
      
      // Format and return the complete order
      return {
        ...order,
        shipping_address: JSON.parse(order.shipping_address),
        billing_address: order.billing_address ? JSON.parse(order.billing_address) : null,
        payment_details: order.payment_details ? JSON.parse(order.payment_details) : null,
        coupon_applied: order.coupon_applied ? JSON.parse(order.coupon_applied) : null,
        items: itemsResult.rows,
        status_history: historyResult.rows
      };
    } catch (err) {
      console.error('Error finding order by ID:', err);
      throw err;
    }
  }

  static async updateOrderStatus(orderId, status, note) {
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update order status
      const updateQuery = `
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
      `;
      
      let updateParams = [status];
      let paramIndex = 2;
      
      // Add timestamp fields based on status
      if (status === 'shipped') {
        updateParams.push(new Date());
        updateQuery += `, shipped_at = $${paramIndex}`;
        paramIndex++;
      } else if (status === 'delivered') {
        updateParams.push(new Date());
        updateQuery += `, delivered_at = $${paramIndex}`;
        paramIndex++;
      } else if (status === 'cancelled') {
        updateParams.push(new Date());
        updateParams.push(note);
        updateQuery += `, cancelled_at = $${paramIndex}, cancel_reason = $${paramIndex + 1}`;
        paramIndex += 2;
      }
      
      updateParams.push(orderId);
      updateQuery += ` WHERE order_id = $${paramIndex} RETURNING *`;
      
      const updateResult = await client.query(updateQuery, updateParams);
      
      // Add to status history
      const historyQuery = `
        INSERT INTO order_status_history (order_id, status, note)
        VALUES ($1, $2, $3)
        RETURNING id, status, note, timestamp
      `;
      
      const historyResult = await client.query(historyQuery, [orderId, status, note]);
      
      await client.query('COMMIT');
      
      // Format and return the updated order status
      const updatedOrder = updateResult.rows[0];
      const statusHistory = historyResult.rows[0];
      
      return {
        id: updatedOrder.order_id,
        status: updatedOrder.status,
        previousStatus: status, // This is actually the new status
        updatedAt: updatedOrder.updated_at,
        statusHistory
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error updating order status:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async updateOrderPayment(orderId, paymentData) {
    const {
      payment_status,
      transaction_id,
      payment_details
    } = paymentData;
    
    const query = `
      UPDATE orders
      SET 
        payment_status = $1,
        payment_details = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $3
      RETURNING *
    `;
    
    const params = [
      payment_status,
      JSON.stringify({
        transaction_id,
        ...payment_details,
        paid_at: new Date()
      }),
      orderId
    ];
    
    try {
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // If payment is successful, update the order status to processing
      if (payment_status === 'paid') {
        await this.updateOrderStatus(orderId, 'processing', 'Thanh toán đã được xác nhận');
      } else if (payment_status === 'failed') {
        await this.updateOrderStatus(orderId, 'pending', 'Thanh toán thất bại, cần thanh toán lại');
      }
      
      const updatedOrder = result.rows[0];
      
      return {
        id: updatedOrder.order_id,
        paymentStatus: updatedOrder.payment_status,
        paymentDetails: JSON.parse(updatedOrder.payment_details),
        updatedAt: updatedOrder.updated_at
      };
    } catch (err) {
      console.error('Error updating order payment:', err);
      throw err;
    }
  }

  static async cancelOrder(orderId, reason) {
    return this.updateOrderStatus(orderId, 'cancelled', reason);
  }

  static async findAllOrders(options = {}) {
    const {
      page = 1,
      limit = 20,
      userId,
      status,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    
    // Basic query
    let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.order_id) as item_count,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add optional filters
    if (userId) {
      query += ` AND o.user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (paymentStatus) {
      query += ` AND o.payment_status = $${paramIndex}`;
      queryParams.push(paymentStatus);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND o.created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND o.created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }
    
    if (minAmount) {
      query += ` AND o.total_amount >= $${paramIndex}`;
      queryParams.push(minAmount);
      paramIndex++;
    }
    
    if (maxAmount) {
      query += ` AND o.total_amount <= $${paramIndex}`;
      queryParams.push(maxAmount);
      paramIndex++;
    }
    
    // Add sorting
    const validSortColumns = ['created_at', 'total_amount', 'status', 'payment_status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY o.${sortColumn} ${order}`;
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    try {
      const result = await db.query(query, queryParams);
      
      // Count total orders for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM orders o
        WHERE 1=1
      `;
      
      const countParams = [];
      paramIndex = 1;
      
      if (userId) {
        countQuery += ` AND o.user_id = $${paramIndex}`;
        countParams.push(userId);
        paramIndex++;
      }
      
      if (status) {
        countQuery += ` AND o.status = $${paramIndex}`;
        countParams.push(status);
        paramIndex++;
      }
      
      if (paymentStatus) {
        countQuery += ` AND o.payment_status = $${paramIndex}`;
        countParams.push(paymentStatus);
        paramIndex++;
      }
      
      if (startDate) {
        countQuery += ` AND o.created_at >= $${paramIndex}`;
        countParams.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        countQuery += ` AND o.created_at <= $${paramIndex}`;
        countParams.push(endDate);
        paramIndex++;
      }
      
      if (minAmount) {
        countQuery += ` AND o.total_amount >= $${paramIndex}`;
        countParams.push(minAmount);
        paramIndex++;
      }
      
      if (maxAmount) {
        countQuery += ` AND o.total_amount <= $${paramIndex}`;
        countParams.push(maxAmount);
        paramIndex++;
      }
      
      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Get summary information
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(total_amount) as total_revenue
        FROM orders
      `;
      
      const summaryResult = await db.query(summaryQuery);
      
      // Format the orders
      const orders = result.rows.map(order => ({
        id: order.order_id,
        userId: order.user_id,
        userName: order.user_name,
        userEmail: order.user_email,
        status: order.status,
        totalAmount: parseFloat(order.total_amount),
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        itemCount: parseInt(order.item_count)
      }));
      
      return {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit
        },
        summary: {
          totalOrders: parseInt(summaryResult.rows[0].total_orders),
          pendingOrders: parseInt(summaryResult.rows[0].pending_orders),
          processingOrders: parseInt(summaryResult.rows[0].processing_orders),
          shippedOrders: parseInt(summaryResult.rows[0].shipped_orders),
          deliveredOrders: parseInt(summaryResult.rows[0].delivered_orders),
          cancelledOrders: parseInt(summaryResult.rows[0].cancelled_orders),
          totalRevenue: parseFloat(summaryResult.rows[0].total_revenue || 0)
        }
      };
    } catch (err) {
      console.error('Error finding all orders:', err);
      throw err;
    }
  }

  static async updateShippingDetails(orderId, trackingData) {
    const {
      tracking_number,
      carrier
    } = trackingData;
    
    const query = `
      UPDATE orders
      SET 
        tracking_number = $1,
        carrier = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $3
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [tracking_number, carrier, orderId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const updatedOrder = result.rows[0];
      
      return {
        id: updatedOrder.order_id,
        trackingNumber: updatedOrder.tracking_number,
        carrier: updatedOrder.carrier,
        updatedAt: updatedOrder.updated_at
      };
    } catch (err) {
      console.error('Error updating shipping details:', err);
      throw err;
    }
  }

  static async issueRefund(orderId, refundData) {
    const {
      amount,
      reason
    } = refundData;
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update order
      const updateQuery = `
        UPDATE orders
        SET 
          payment_status = 'refunded',
          updated_at = CURRENT_TIMESTAMP,
          status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          cancel_reason = $1
        WHERE order_id = $2
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [reason, orderId]);
      
      if (updateResult.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      // Add to status history
      const historyQuery = `
        INSERT INTO order_status_history (order_id, status, note)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(historyQuery, [
        orderId, 
        'cancelled', 
        `Đơn hàng đã bị hủy và hoàn tiền. Lý do: ${reason}`
      ]);
      
      await client.query('COMMIT');
      
      const updatedOrder = updateResult.rows[0];
      
      return {
        id: updatedOrder.order_id,
        refundId: `ref_${Date.now()}`,
        amount,
        refundedAt: new Date(),
        paymentStatus: updatedOrder.payment_status,
        reason,
        status: updatedOrder.status,
        message: 'Hoàn tiền đã được xử lý thành công'
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error issuing refund:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async generateOrderReport(options = {}) {
    const {
      startDate,
      endDate,
      status,
      groupBy = 'daily'
    } = options;
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    // Determine the date format based on groupBy
    let dateFormat;
    switch (groupBy) {
      case 'monthly':
        dateFormat = 'YYYY-MM-01';
        break;
      case 'weekly':
        dateFormat = 'YYYY-"W"IW';
        break;
      case 'daily':
      default:
        dateFormat = 'YYYY-MM-DD';
        break;
    }
    
    // Build the query
    let query = `
      SELECT 
        TO_CHAR(created_at, '${dateFormat}') as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        SUM(tax) as tax,
        SUM(shipping_cost) as shipping,
        AVG(total_amount) as average_order_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    const queryParams = [startDate, endDate];
    let paramIndex = 3;
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    query += ` GROUP BY TO_CHAR(created_at, '${dateFormat}')
               ORDER BY date ASC`;
    
    // Get totals
    let totalsQuery = `
      SELECT 
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        SUM(tax) as tax,
        SUM(shipping_cost) as shipping,
        AVG(total_amount) as average_order_value
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    const totalsParams = [startDate, endDate];
    paramIndex = 3;
    
    if (status) {
      totalsQuery += ` AND status = $${paramIndex}`;
      totalsParams.push(status);
    }
    
    try {
      const result = await db.query(query, queryParams);
      const totalsResult = await db.query(totalsQuery, totalsParams);
      
      return {
        reportId: `rep_${Date.now()}`,
        generatedAt: new Date(),
        period: {
          startDate,
          endDate
        },
        totals: {
          orders: parseInt(totalsResult.rows[0].orders),
          revenue: parseFloat(totalsResult.rows[0].revenue || 0),
          tax: parseFloat(totalsResult.rows[0].tax || 0),
          shipping: parseFloat(totalsResult.rows[0].shipping || 0),
          averageOrderValue: parseFloat(totalsResult.rows[0].average_order_value || 0)
        },
        data: result.rows.map(row => ({
          date: row.date,
          orders: parseInt(row.orders),
          revenue: parseFloat(row.revenue || 0),
          tax: parseFloat(row.tax || 0),
          shipping: parseFloat(row.shipping || 0),
          averageOrderValue: parseFloat(row.average_order_value || 0),
          statusBreakdown: {
            pending: parseInt(row.pending),
            processing: parseInt(row.processing),
            shipped: parseInt(row.shipped),
            delivered: parseInt(row.delivered),
            cancelled: parseInt(row.cancelled)
          }
        }))
      };
    } catch (err) {
      console.error('Error generating order report:', err);
      throw err;
    }
  }
}

 