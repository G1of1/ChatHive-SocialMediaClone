import Post from '../models/post.js';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/user.js';
import Notification from '../models/notification.js';

export const createPost = async (req, res) => {
    //Creates a post from the text and img(plan to include videos in the future)
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userID = req.user._id;

        const user = await User.findOne(userID);
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        if(!text && !img) {
            return res.status(400).json({error: "Post must have text or image"});
        }
        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userID,
            text: text,
            img: img
        });
        await newPost.save();
        res.status(200).json(newPost);
    } 
    catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
export const deletePost = async (req, res) => {
    //Deleting post through the post ID
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(400).json({error: "No post to delete"})
        }

        if(post.user._id.toString() !== req.user._id.toString()) {
            res.status(400).json({error: "You are not authorized to delete this post"});
        }

        if(post.img) {
            const imgID = post.img.split("/").pop().split('.')[0];
            await cloudinary.uploader.destroy(imgID);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post deleted succesfully"});
    } 
    catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});    
    }
}
export const likeUnlikePost = async (req, res) => {
    //Liking/Unliking through the post ID
    try {
        
        const { id } = req.params;
        const userID = req.user._id;

        const post = await Post.findById(id);

        if(!post) {
            return res.status(400).json({error: "Post not found"});
        }
        const isLiked = post.likes.includes(userID);
        if(isLiked) {
            await Post.updateOne({_id: id}, {$pull: {likes: userID}});
            await User.updateOne({_id: userID}, {$pull: {likedPosts: id}});
            const updatedLikes = post.likes.filter((like) => like.toString() !== userID.toString());
            res.status(200).json(updatedLikes);
        }
        else {
            post.likes.push(userID);
            await User.updateOne({_id: userID}, {$push: {likedPosts: id}});
            await post.save();
            const notification = new Notification({
                from: userID,
                to: post.user,
                type: 'like',
                post: id
            });
            await notification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }

    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
    
}
export const saveUnSavePost = async (req, res) => {
    //Saving/Unsaving thorugh the post ID
    const { id: postID } = req.params;
    const userID = req.user._id;
    try {
        const post = await Post.findById(postID);
        if(!post) {
            return res.status(400).json({error: "Post not found"});
        }
        const isSaved = post.saves.includes(userID);

        if(isSaved) {
            await Post.updateOne({_id: postID}, {$pull: {saves: userID}});
            await User.updateOne({_id: userID}, {$pull: {savedPosts: postID}});
            const updatedSaves = post.saves.filter((save) => save.toString() !== userID.toString());
            res.status(200).json(updatedSaves);
        }
        else {
            post.saves.push(userID);
            await User.updateOne({_id: userID}, {$push:{savedPosts: postID}});
            await post.save();
            const updatedSaves = post.saves;
            res.status(200).json(updatedSaves);
        }
    } 
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userID = req.user._id;
        const postID = req.params.id;

        if(!text) {
            return res.status(400).json({error: "Text is required"})
        }
        const post = await Post.findById(postID);
        if(!post) {
            return res.status(400).json({error: "Post not found"});
        }

        const comment = {user : userID, text};
        post.comments.push(comment);
        const updatedComments = post.comments;
        await post.save();
        res.status(200).json(updatedComments);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"}).populate({path: "comments.user", select: "-password"});

        if(posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    }
catch(error) {
    res.status(500).json({error: `Internal Server Error: ${error.message}`});
}
}

export const getLikedPosts = async (req, res) => {
    const userID = req.params.id;
    try {
        const user = await User.findById(userID);

        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        res.status(200).json(likedPosts);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
    
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userID = req.user._id;
        const user = await User.findById(userID);
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const following = user.following;

        const followingPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        res.status(200).json(followingPosts);

    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        
        const user = await User.findOne({username});
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const posts = await Post.find({user: user._id}).sort({createdAt : -1}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path:"comments.user",
            select: '-password'
        });
        res.status(200).json(posts);
        
    } 
    catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
export const deleteComment = async (req, res) => {
    const { postID } = req.params;
    const userID = req.user._id;
    const { commentID } = req.body;
    try {
        const post = await Post.findById(postID);
        if(!post) {
            return res.status(400).json({error: 'Post not found'});
        }
        const comment = post.comments.find((comment) => comment._id.toString() === commentID);
        if(!comment) {
            return res.status(400).json({error: 'Comment not found'});
        }
        if(comment.user.toString() !== userID.toString()) {
            res.status(400).json({error: 'You are not authorized to delete this comment'});
        }
        post.comments = post.comments.filter((comment) => comment._id.toString() !== commentID);
        const updatedComments = post.comments;
        await post.save();
        res.status(200).json(updatedComments);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
export const getSavedPosts = async (req, res) => {
    const userID = req.params.id;
    try {
        if(userID.toString() !== req.user._id.toString()) {
            return res.status(400).json({error: "You are not authorized!"});
        }
        const user = await User.findById(userID);
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const savedPosts = await Post.find({_id: {$in: user.savedPosts}}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        res.status(200).json(savedPosts);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}