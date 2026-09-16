import Knowledge from "../models/Knowledge.js";

export async function searchKnowledge(query) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    if (words.length === 0) {
      return [];
    }

    const conditions = words.map((word) => ({
      $or: [
        { title: { $regex: word, $options: "i" } },
        { content: { $regex: word, $options: "i" } },
        { category: { $regex: word, $options: "i" } }
      ]
    }));

    const results = await Knowledge.find({
      active: true,
      $or: conditions
    })
      .limit(5)
      .lean();

    return results;
  } catch (error) {
    console.error("Knowledge search error:", error.message);
    return [];
  }
}