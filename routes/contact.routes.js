const express = require("express");

const router = express.Router();

const {
createMessage,
getMessages,
getMessageById,
deleteMessage
} = require("../controllers/contact.controller");

router.post("/", createMessage);

router.get("/", getMessages);

router.get("/:id", getMessageById);

router.delete("/:id", deleteMessage);

module.exports = router;