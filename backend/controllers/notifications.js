
import Notification  from '../models/notification.js';

export const getNotifications = async (req, res) => {
    //Retrives the notifications through the user's ID
    const userID = req.user._id;
    try {
        const notifications = await Notification.find({ to: userID}).populate({
            path: "from",
            select: "username profilePic"
        });

        await Notification.updateMany({to: userID}, {read: true});
        res.status(200).json(notifications);
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const deleteNotifications = async (req, res) => {
    // To delete all notifications
    try {
        const userID = req.user._id;
        await Notification.deleteMany({to: userID});
        res.status(200).json({message: "Notifications deleted succesfully."})
    } 
    catch (error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}

export const deleteNotification = async (req, res) => {
    //For the deletion of just one notificaiton(plan to include the implementation for this feature)
    try {
        const { id } = req.params;
        const userID = req.user._id;
        const notification = await Notification.findById(id);
        if(!notification) {
            res.status(400).json({error: "Notification not found"});
        }

        if(notification.to.toString() !== userID.toString()) {
            res.status(403).json({error: "You are not allowed to delete this notification"});
        }

        await Notification.findByIdAndDelete(id);
        res.status(200).json({message: "Notification deleted succesfully."});
    }
    catch(error) {
        res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}