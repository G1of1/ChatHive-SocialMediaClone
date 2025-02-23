import Notification from "../models/notification.js";
import { User } from "../models/user.js";
import bcryptjs from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
//Gets the profile of the target user
export const getProfile = async (req, res) => {
    //Get the profile of specified user
    const { username } = req.params;
    try {
        const user =  await User.findOne({username}).select("-password");
        if(!user) {
            return res.status(400).json({ error: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
//Follow/Unfollow User
export const followUnfollowUser = async (req, res) => {
    try {
        //Set the variables for the current user and user that the current user is trying to follow or unfollow
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()) {
           return res.status(400).json({error: "You cannot follow/unfollow yourself"});
        }

        if(!userToModify || !currentUser) {
           return res.status(400).json({error: "User not found"});
        }
        //Determine if the current user is following or unfollowing targeted user
        const isFollowing = currentUser.following.includes(id);
        //To unfollow
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $pull: {following: id}});
            // TODO: return the id of the user as a response
            const userWithoutPassword = await User.findById(id).select("-password");
            res.status(200).json(userWithoutPassword);
        } 
        //To follow
        else {
            await User.findByIdAndUpdate(id, { $push: {followers: req.user._id }});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: id
            });
            await newNotification.save();
            const userWithoutPassword = await User.findById(id).select("-password");
            res.status(200).json(userWithoutPassword);
        }
        
    } catch (error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
}
//For suggested users
export const getSuggestedUsers = async (req, res) => {
    try {
        const userID = req.user._id;
        //Get the users followed by the user
        const usersFollowedByMe = await User.findById(userID).select("following");
        //Get a random sample of 10 users following the user excluding themselves
        const users = await User.aggregate([
            {$match: { _id: {$ne:userID}}},
            {$sample: {size: 4}},
        ]);
        // Filter the users that are currently following the user
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
         //Take the first 5
        const suggestedUsers = filteredUsers.slice(0, 5);
        suggestedUsers.forEach(user => user.password = null);
        //Return those users without password
        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
}
//Update the user profile
export const updateProfile = async (req, res) => {
    const { fullName , email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profilePic, banner } = req.body;
    const userID = req.user._id;

    try {
        //Find the user in the database
        let user = await User.findOne(userID);
        if (!user) {
            return res.status(400).json({error: "User not found"});
        }
        //Make sure the user provides both the current and new passwords
        if((!currentPassword && newPassword ) || (!newPassword && currentPassword)) {
            return res.status(400).json({error: "Please provide both current and new passwords"})
        }
        //Determine if its the password is in the correct format if the current password is correct, then change the password
        if(currentPassword && newPassword) {
            const isMatch = await bcryptjs.compare(currentPassword, user.password);
            if(!isMatch) {
               return res.status(400).json({error: "Current password is incorrect"});
            }
            if(newPassword.length < 6) {
               return res.status(400).json({error: "Password must be at least 6 characters"})
            }
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);
        }
        //Process all the changes to if the user changes their profile picture or banner
        if(profilePic) {
            if(user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadResponse.secure_url;
        }
        if(banner) {
            if(user.banner) {
                await cloudinary.uploader.destroy(user.banner.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(banner);
            banner = uploadResponse.secure_url;
        }
        //Change the fields the user choices to change and then save and return the user without their password in the response
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profilePic = profilePic || user.profilePic;
        user.banner = banner || user.banner;

        user = await user.save();
        user.password = null;
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
export const getFollowers = async (req, res) => {
    const { username } = req.params;
    const userID = req.user._id;

    try {
        const user = await User.findOne({username}).select('-password');
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const followersObject = await User.findById(userID).select('followers');
        const followersIDs = followersObject.followers;
        const followers = [];
        for(let i = 0; i < followersIDs.length; i++) {
            const user = await User.findById(followersIDs[i]);
            followers.push(user);
        }
        const filteredFollowers = followers.filter((user) => user !== null);
        filteredFollowers.forEach(user => user.password = null);
        res.status(200).json(filteredFollowers);
    } 
    catch (error) {
     res.status(500).json({error: `Internal Server Error: ${error.message}`});   
    }
}

export const getFollowing = async (req, res) => {
    const { username } = req.params;
    const userID = req.user._id;
    try {
        const user = await User.findOne({username}).select('-password');
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const followingObject = await User.findById(userID).select('following');
        const followingIDs = followingObject.following;
        const following = [];
        for (let i = 0; i < followingIDs.length; i++) {
            const user = await User.findById(followingIDs[i]);
            following.push(user);
        }
        const filteredFollowing = following.filter((user) => user !== null);
        filteredFollowing.forEach(user => user.password = null);
        res.status(200).json(filteredFollowing);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}