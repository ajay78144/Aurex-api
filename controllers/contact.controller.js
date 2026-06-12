const Contact = require("../models/contact");

// Create Message
const createMessage = async (req,res)=>{

try{

const message = await Contact.create(req.body);

res.status(201).json(message);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};

// Get All Messages
const getMessages = async (req,res)=>{

try{

const messages = await Contact.find()
.sort({createdAt:-1});

res.json(messages);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};

// Get Single Message
const getMessageById = async (req,res)=>{

try{

const message = await Contact.findById(req.params.id);

if(!message){

return res.status(404).json({
message:"Message not found"
});

}

res.json(message);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};

// Delete Message
const deleteMessage = async (req,res)=>{

try{

await Contact.findByIdAndDelete(req.params.id);

res.json({
message:"Message deleted"
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};

module.exports = {
createMessage,
getMessages,
getMessageById,
deleteMessage
};