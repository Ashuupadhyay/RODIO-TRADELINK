const express = require("express");

const router = express.Router();

const { addComment,getTransporterComments} = require("../controllers/commentController");

const isAuthenticated = require("../middlewhere/auth");

router.post("/:id", isAuthenticated, addComment);
router.get("/:id", getTransporterComments);

module.exports = router;