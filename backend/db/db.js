import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
//Creating the connection to the server. Used in server.js
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }
    catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}