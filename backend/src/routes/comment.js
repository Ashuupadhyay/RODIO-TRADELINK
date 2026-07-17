const express = require("express");

const router = express.Router();

const { addComment} = require("../controllers/commentController");

const isAuthenticated = require("../middlewhere/auth");

router.post("/:id", isAuthenticated, addComment);

module.exports = router;