import express from 'express';
import { middleWare } from '../middleware/middleware.js';
import { getProfile, followUnfollowUser, getSuggestedUsers, updateProfile, getFollowers, getFollowing } from '../controllers/user.js';
const router = express.Router();
// User Routes
router.get('/profile/:username',middleWare,  getProfile);
router.get('/suggested',middleWare, getSuggestedUsers);
router.post('/follow/:id', middleWare, followUnfollowUser);
router.post('/update', middleWare, updateProfile);
router.get('/followers/:username', middleWare, getFollowers);
router.get('/following/:username', middleWare, getFollowing);
export default router;