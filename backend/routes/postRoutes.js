import express from 'express';
import { middleWare } from '../middleware/middleware.js';

import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts, deleteComment, getSavedPosts, saveUnSavePost } from '../controllers/post.js';

//Post routes
const router = express.Router();
//Get post for to display in the home page
router.get('/forYou', middleWare, getAllPosts);
//Get the post of the people the user is following
router.get('/following', middleWare, getFollowingPosts);
//Get a specific users post
router.get('/users/:username', middleWare, getUserPosts);
//Get the liked posts
router.get('/likes/:id', middleWare, getLikedPosts);
router.get('/saved/:id', middleWare, getSavedPosts);
//Creation of post
router.post('/create', middleWare, createPost);
//Deletion of posts
router.delete('/:id', middleWare, deletePost);
//For liking and unliking posts
router.post('/likes/:id', middleWare, likeUnlikePost);
//Commenting on a post
router.post('/comment/:id', middleWare, commentOnPost);
router.post('/saved/:id', middleWare, saveUnSavePost);
//Deleting a comment
router.delete('/comment/:postID', middleWare, deleteComment);


export default router;
