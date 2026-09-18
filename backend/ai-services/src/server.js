import express from "express";
import { connectDB } from "./services/db.js";
import { searchDirectory } from "./tools/directoryTool.js";
import cors from "cors";
import dotenv from "dotenv";
import knowledgeRoutes from "./routs/knowledge.js";
import { askOllama } from "./services/ollamaService.js";
import { searchKnowledge } from "./services/knowledgeService.js";
import { parseDirectoryQuery } from "./tools/queryParser.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai/knowledge", knowledgeRoutes);
app.get("/api/ai/test-parser", async (req, res) => {
  try {
    const message = req.query.message || "";

    const result = await parseDirectoryQuery(message);

    res.json({
      success: true,
      message,
      parsed: result
    });
  } catch (error) {
    console.error("Parser test error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/api/ai/health", (req, res) => {
  res.json({
    success: true,
    message: "Rodio AI Service is running"
  });
});
app.get("/api/ai/test", async (req, res) => {
  try {
    const message = req.query.message || "Hello Rodio AI";

    // MongoDB se relevant knowledge search
    const knowledgeResults = await searchKnowledge(message);

    // Knowledge ko readable text me convert karna
    const knowledgeText = knowledgeResults
      .map((item) => {
        return `
Title: ${item.title}
Category: ${item.category}
Information: ${item.content}
`;
      })
      .join("\n");

    const prompt = `
You are Rodio AI, the AI assistant for Rodio Tradelink.

Use the provided Rodio Tradelink information to answer the user's question.

IMPORTANT RULES:
- Answer only using the provided information when the question is about Rodio Tradelink.
- Do not invent Rodio information.
- If the information is not available, clearly say that you don't have that information.
- Reply in the same language as the user.
- Hindi question → Hindi answer.
- Hinglish question → natural Hinglish answer.
- English question → English answer.
- Keep the answer simple and conversational.

RODIO TRADELINK INFORMATION:
${knowledgeText || "No relevant Rodio information was found."}

USER QUESTION:
${message}

ANSWER:
`;

    const reply = await askOllama(prompt);

    res.json({
      success: true,
      message,
      reply,
      knowledgeFound: knowledgeResults.length
    });
  } catch (error) {
    console.error("AI test error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
app.get("/api/ai/test-directory", async (req, res) => {
  try {
    const result = await searchDirectory({
      state: req.query.state,
      city: req.query.city,
      category: req.query.category
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Directory AI test error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
const PORT = process.env.AI_PORT || 5001;
await connectDB();
app.listen(PORT, () => {
  console.log(`Rodio AI Service running on port ${PORT}`);
});