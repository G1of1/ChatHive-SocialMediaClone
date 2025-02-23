import express from 'express';
const router = express.Router();
import { middleWare } from '../middleware/middleware.js';
import { register, login, logout, getMe } from '../controllers/auth.js';
//Authentication Routes
router.get('/me', middleWare, getMe)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)


export default router;