const Cart = require('../models/cart.model');

// Lấy giỏ hàng của người dùng hiện tại
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cart = await Cart.getCart(userId);
    
    res.json(cart);
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId, quantity } = req.body;
    
    // Validate dữ liệu đầu vào
    if (!productId || !quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return res.status(400).json({
        message: 'Dữ liệu sản phẩm không hợp lệ',
        details: [
          !productId ? { field: 'productId', message: 'ID sản phẩm là bắt buộc' } : null,
          !quantity ? { field: 'quantity', message: 'Số lượng là bắt buộc' } : null,
          quantity && (isNaN(quantity) || parseInt(quantity) <= 0) ? 
            { field: 'quantity', message: 'Số lượng phải là số dương' } : null
        ].filter(Boolean)
      });
    }
    
    const item = {
      productId,
      quantity: parseInt(quantity)
    };
    
    const updatedCart = await Cart.addItem(userId, item);
    
    res.json(updatedCart);
  } catch (err) {
    console.error('Error adding item to cart:', err);
    
    if (err.message.includes('Không thể thêm sản phẩm vào giỏ hàng')) {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Validate dữ liệu đầu vào
    if (!quantity || isNaN(quantity) || parseInt(quantity) < 0) {
      return res.status(400).json({
        message: 'Số lượng không hợp lệ',
        details: [
          { field: 'quantity', message: 'Số lượng phải là số không âm' }
        ]
      });
    }
    
    const updatedCart = await Cart.updateItem(userId, productId, parseInt(quantity));
    
    res.json(updatedCart);
  } catch (err) {
    console.error('Error updating cart item:', err);
    
    if (err.message.includes('Sản phẩm không có trong giỏ hàng')) {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.params;
    
    const updatedCart = await Cart.removeItem(userId, productId);
    
    res.json(updatedCart);
  } catch (err) {
    console.error('Error removing item from cart:', err);
    
    if (err.message.includes('Sản phẩm không có trong giỏ hàng')) {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const emptyCart = await Cart.clearCart(userId);
    
    res.json({
      message: 'Giỏ hàng đã được xóa thành công',
      cart: emptyCart
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Áp dụng mã giảm giá
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        message: 'Mã giảm giá là bắt buộc',
        details: [
          { field: 'couponCode', message: 'Mã giảm giá không được để trống' }
        ]
      });
    }
    
    try {
      const updatedCart = await Cart.applyCoupon(userId, couponCode);
      res.json(updatedCart);
    } catch (error) {
      if (error.message.includes('Mã giảm giá không hợp lệ')) {
        return res.status(400).json({ 
          message: error.message,
          details: [
            { field: 'couponCode', message: error.message }
          ]
        });
      }
      throw error;
    }
  } catch (err) {
    console.error('Error applying coupon:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xóa mã giảm giá
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const updatedCart = await Cart.removeCoupon(userId);
    
    res.json({
      message: 'Mã giảm giá đã được xóa thành công',
      cart: updatedCart
    });
  } catch (err) {
    console.error('Error removing coupon:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Kiểm tra giỏ hàng trước khi đặt hàng
exports.validateCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Lấy giỏ hàng
    const cart = await Cart.getCart(userId);
    
    // Kiểm tra giỏ hàng có sản phẩm không
    if (!cart.items.length) {
      return res.status(400).json({
        valid: false,
        message: 'Giỏ hàng trống',
        cart
      });
    }
    
    // Kiểm tra tồn kho
    const stockValidation = await Cart.validateStock(userId);
    
    if (!stockValidation.isValid) {
      return res.status(400).json({
        valid: false,
        message: 'Một số sản phẩm không đủ số lượng tồn kho',
        issues: stockValidation.issues,
        cart
      });
    }
    
    res.json({
      valid: true,
      cart
    });
  } catch (err) {
    console.error('Error validating cart:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}; 