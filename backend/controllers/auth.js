import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
export const register = async (req, res) => {
    try {
        // Takes all the given fields from the request
        const { username, password, email, fullName } = req.body;
        //Used to determine if the email is in the right format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            res.status(400).json({error: "Invalid email format"})
        }
        //Determines whether a user is in the database with the same username or email
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        const passwordLength = password.length;
        if(existingUser) { 
            res.status(400).json({error: "User already taken"});
        }
        if(existingEmail) {
            res.status(400).json({error: "Email already taken"});
        }
        if(passwordLength < 6) {
            res.status(400).json({error: "Password must be at least 6 characters"});
        }
        //Creates the salt and hashes the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //New user is created and saved as well as given a cookie and token
        const newUser = new User({fullName, username, email, password:hashedPassword});

        if(newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic,
                banner: newUser.banner,
                followers: newUser.followers,
                following: newUser.following
            });
        }
        else{
            res.status(400).json({ error: "Invalid User Data"})
        }
    }
    catch(error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
    
}

export const login = async (req, res) => {
    try {
        //Uses the username and password from the request to log the user in and provide the token and cookie
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPass = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPass) {
            res.status(400).json({error: `Invalid credentials`});
        }
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                banner: user.banner,
                followers: user.followers,
                following: user.following
        });
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const logout = async (req, res) => {
    try {
        //Set the cookie to nothing to log the user out
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Successfully logged out"});
    } catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`})
    }

}

export const getMe = async (req, res) => {
    //Recieve the user info
    try {
      const user = await User.findById(req.user._id).select("-password");
      res.status(200).json(user);
    } catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
