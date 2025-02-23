import mongoose from "mongoose";
// User Model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    fullName: {
        type: String,
        required: true,
    },
    followers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //Reference to the type of model which is user
        default: [] //By default the user will have zero followers
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        deafult: []
    }],
    profilePic: {
        type: String,
        default: ""
    },
    banner: {
        type: String,
        deafult: ""
    },
    bio: {
        type: String,
        deafult: ""
    },
    link: {
        type: String, 
        default: ""
    },
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: []
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        deafult: []
    }]
}, {
    timestamps: true
})
export const User = mongoose.model("User", userSchema);
