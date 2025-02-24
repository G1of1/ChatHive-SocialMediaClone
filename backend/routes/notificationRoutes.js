import express from 'express';
const router = express.Router();
import { middleWare } from '../middleware/middleware.js';
import { getNotifications, deleteNotifications, deleteNotification } from '../controllers/notifications.js';
//Notification Routes
router.get('/', middleWare, getNotifications);
router.delete('/', middleWare, deleteNotifications);
router.delete('/:id', middleWare, deleteNotification);




export default router;