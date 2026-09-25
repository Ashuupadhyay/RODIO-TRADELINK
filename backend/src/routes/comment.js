const express = require("express");
const protect=require("../middlewhere/protectAPi");

const router = express.Router();

const { addComment,getTransporterComments} = require("../controllers/commentController");

const isAuthenticated = require("../middlewhere/auth");

router.post("/:id", protect,isAuthenticated, addComment);
router.get("/:id",protect, getTransporterComments);

module.exports = router;