const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Public routes
router.get('/profile/:userId', userController.getUserProfile);

// Protected routes
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/:userId', authMiddleware, userController.getUserById);
router.post('/', authMiddleware, adminMiddleware, userController.createUser);
router.put('/:userId', authMiddleware, userController.updateUser);
router.delete('/:userId', authMiddleware, adminMiddleware, userController.deleteUser);
router.put('/profile/update', authMiddleware, userController.updateProfile);

module.exports = router;