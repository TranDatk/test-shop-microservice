const redis = require('../config/redis.config');
const axios = require('axios');

class Cart {
  static async getCart(userId) {
    try {
      const cartKey = `cart:${userId}`;
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
        // Tạo giỏ hàng mới nếu chưa tồn tại
        const newCart = {
          userId,
          items: [],
          totals: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await redis.set(cartKey, JSON.stringify(newCart));
        return newCart;
      }
      
      return JSON.parse(cartData);
    } catch (err) {
      console.error('Error getting cart:', err);
      throw err;
    }
  }

  static async addItem(userId, item) {
    try {
      const cart = await this.getCart(userId);
      const cartKey = `cart:${userId}`;
      
      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
      
      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Lấy thông tin sản phẩm từ product service
        try {
          const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
          const product = response.data;
          
          // Thêm sản phẩm vào giỏ hàng
          cart.items.push({
            productId: item.productId,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            imageUrl: product.image_url
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
        }
      }
      
      // Tính toán lại tổng giỏ hàng
      await this.recalculateCart(cart);
      
      // Lưu giỏ hàng
      await redis.set(cartKey, JSON.stringify(cart));
      
      return cart;
    } catch (err) {
      console.error('Error adding item to cart:', err);
      throw err;
    }
  }

  static async updateItem(userId, productId, quantity) {
    try {
      const cart = await this.getCart(userId);
      const cartKey = `cart:${userId}`;
      
      // Tìm sản phẩm trong giỏ hàng
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Sản phẩm không có trong giỏ hàng');
      }
      
      if (quantity <= 0) {
        // Xóa sản phẩm nếu số lượng <= 0
        cart.items.splice(itemIndex, 1);
      } else {
        // Cập nhật số lượng
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Tính toán lại tổng giỏ hàng
      await this.recalculateCart(cart);
      
      // Lưu giỏ hàng
      await redis.set(cartKey, JSON.stringify(cart));
      
      return cart;
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw err;
    }
  }

  static async removeItem(userId, productId) {
    try {
      const cart = await this.getCart(userId);
      const cartKey = `cart:${userId}`;
      
      // Tìm và xóa sản phẩm
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Sản phẩm không có trong giỏ hàng');
      }
      
      cart.items.splice(itemIndex, 1);
      
      // Tính toán lại tổng giỏ hàng
      await this.recalculateCart(cart);
      
      // Lưu giỏ hàng
      await redis.set(cartKey, JSON.stringify(cart));
      
      return cart;
    } catch (err) {
      console.error('Error removing item from cart:', err);
      throw err;
    }
  }

  static async clearCart(userId) {
    try {
      const cartKey = `cart:${userId}`;
      
      // Tạo giỏ hàng mới (trống)
      const emptyCart = {
        userId,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Lưu giỏ hàng trống
      await redis.set(cartKey, JSON.stringify(emptyCart));
      
      return emptyCart;
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  }

  static async applyCoupon(userId, couponCode) {
    try {
      const cart = await this.getCart(userId);
      const cartKey = `cart:${userId}`;
      
      // Trong ứng dụng thực tế, bạn sẽ gọi một coupon service ở đây
      // Giả lập xử lý coupon đơn giản
      let discount = 0;
      
      if (couponCode === 'WELCOME10') {
        discount = Math.round(cart.totals.subtotal * 0.1 * 100) / 100; // Giảm 10%
        cart.coupon = {
          code: couponCode,
          discount,
          type: 'percentage',
          value: 10
        };
      } else if (couponCode === 'FREESHIP') {
        discount = cart.totals.shipping;
        cart.coupon = {
          code: couponCode,
          discount,
          type: 'shipping',
          value: 'free'
        };
      } else {
        throw new Error('Mã giảm giá không hợp lệ');
      }
      
      // Cập nhật giảm giá
      cart.totals.discount = discount;
      cart.totals.total = cart.totals.subtotal + cart.totals.tax + cart.totals.shipping - discount;
      cart.updatedAt = new Date();
      
      // Lưu giỏ hàng
      await redis.set(cartKey, JSON.stringify(cart));
      
      return cart;
    } catch (err) {
      console.error('Error applying coupon:', err);
      throw err;
    }
  }

  static async removeCoupon(userId) {
    try {
      const cart = await this.getCart(userId);
      const cartKey = `cart:${userId}`;
      
      // Xóa coupon
      delete cart.coupon;
      
      // Tính toán lại tổng
      cart.totals.discount = 0;
      cart.totals.total = cart.totals.subtotal + cart.totals.tax + cart.totals.shipping;
      cart.updatedAt = new Date();
      
      // Lưu giỏ hàng
      await redis.set(cartKey, JSON.stringify(cart));
      
      return cart;
    } catch (err) {
      console.error('Error removing coupon:', err);
      throw err;
    }
  }

  static async recalculateCart(cart) {
    try {
      // Tính tổng phụ
      let subtotal = 0;
      for (const item of cart.items) {
        subtotal += item.price * item.quantity;
      }
      
      // Làm tròn đến 2 chữ số thập phân
      subtotal = Math.round(subtotal * 100) / 100;
      
      // Tính thuế (10%)
      const tax = Math.round(subtotal * 0.1 * 100) / 100;
      
      // Tính phí vận chuyển (miễn phí nếu tổng > 1000)
      const shipping = subtotal > 1000 ? 0 : 50;
      
      // Áp dụng giảm giá nếu có
      let discount = 0;
      if (cart.coupon) {
        if (cart.coupon.type === 'percentage') {
          discount = Math.round(subtotal * (cart.coupon.value / 100) * 100) / 100;
        } else if (cart.coupon.type === 'shipping') {
          discount = shipping;
        } else {
          discount = cart.coupon.discount;
        }
      }
      
      // Tính tổng
      const total = subtotal + tax + shipping - discount;
      
      // Cập nhật tổng cho giỏ hàng
      cart.totals = {
        subtotal,
        tax,
        shipping,
        discount,
        total
      };
      
      cart.updatedAt = new Date();
      
      return cart;
    } catch (err) {
      console.error('Error recalculating cart:', err);
      throw err;
    }
  }

  static async validateStock(userId) {
    try {
      const cart = await this.getCart(userId);
      const stockIssues = [];
      
      // Kiểm tra tồn kho cho mỗi sản phẩm
      for (const item of cart.items) {
        try {
          const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
          const product = response.data;
          
          if (product.stock < item.quantity) {
            stockIssues.push({
              productId: item.productId,
              name: item.name,
              requested: item.quantity,
              available: product.stock
            });
          }
        } catch (error) {
          console.error('Error fetching product for stock validation:', error);
          stockIssues.push({
            productId: item.productId,
            name: item.name,
            error: 'Không thể kiểm tra tồn kho'
          });
        }
      }
      
      return {
        isValid: stockIssues.length === 0,
        issues: stockIssues
      };
    } catch (err) {
      console.error('Error validating stock:', err);
      throw err;
    }
  }
}

module.exports = Cart; 