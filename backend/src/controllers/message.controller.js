import User from "../models/User.js";
import Message from "../models/message.model.js"

export const getUsersForSidebar  = async (req,res)=>{
try {
    const loggedInUserId = req.user_id;
    const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-passowrd")
    res.status(200).json(filteredUsers)

} catch (error) {
    console.log("Error in getUsersForSidebar : " , error.message);
    res.status(500).json({
        error : "Internal server error"
    })
    
}
};

export const getMessages = async (req,res)=>{
    try {
        const {id : userToChatId} = req.params
        const senderID = req.user._id; // currently authenticated user
     const messages = await Message.find({
    $or: [
        { senderId: senderID, receiverID: userToChatId },
        { senderId: userToChatId, receiverID: senderID }
    ]
})


    } catch (error) {
        
    }
}