import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    category: {
      type: String,
      default: "general"
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Knowledge = mongoose.model("Knowledge", knowledgeSchema);

export default Knowledge;