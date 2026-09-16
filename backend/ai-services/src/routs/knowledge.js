import express from "express";
import Knowledge from "../models/Knowledge.js";
import { searchKnowledge } from "../services/knowledgeService.js";

const router = express.Router();

// Add knowledge
router.post("/", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    const knowledge = await Knowledge.create({
      title,
      content,
      category
    });

    res.status(201).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all knowledge
router.get("/", async (req, res) => {
  try {
    const knowledge = await Knowledge.find({ active: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const results = await searchKnowledge(q);

    res.json({
      success: true,
      query: q,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
export default router;