const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

export async function askOllama(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `
You are Rodio AI, the helpful AI assistant for Rodio Tradelink.

Language rules:
- If the user speaks Hindi, reply in Hindi.
- If the user speaks Hinglish, reply naturally in Hinglish.
- If the user speaks English, reply in English.
- If the user mixes Hindi and English, reply naturally in Hinglish.
- Keep answers simple, friendly and conversational.
- Do not invent information about Rodio Tradelink.

User message:
${prompt}

Answer:
        `,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    return data.response;
  } catch (error) {
    console.error("Ollama service error:", error.message);
    throw error;
  }
}