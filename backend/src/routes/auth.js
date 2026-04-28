const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register, login, getMe, logout,
  forgotPassword, resetPassword, updatePassword, refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

// Validators
const registerValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('companyName').optional().trim().isLength({ max: 100 }),
  body('phone').optional().matches(/^[+]?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new client admin account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               email:     { type: string, format: email }
 *               password:  { type: string, minLength: 8 }
 *               companyName: { type: string }
 *               phone:     { type: string }
 *               industry:  { type: string }
 *     responses:
 *       201: { description: Account created successfully }
 *       400: { description: Validation error or email exists }
 */
router.post('/register', registerValidators, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     security: []
 */
router.post('/login', loginValidators, validate, login);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', body('email').isEmail().withMessage('Enter valid email'), validate, forgotPassword);
router.put('/reset-password/:token',
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
  validate, resetPassword
);
router.put('/update-password', protect,
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Min 8 characters'),
  validate, updatePassword
);
router.post('/refresh-token', refreshToken);

module.exports = router;
