import "dotenv/config";
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const RODIO_API_BASE_URL = process.env.RODIO_API_BASE_URL;

export async function parseDirectoryQuery(message) {
  try {
    // 1. Qwen se city/category identify
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen2.5:0.5b",

        prompt: `You are a Rodio Tradelink query parser.

Extract only the city and category from the user's request.

Rules:
- Return JSON only.
- No explanation.
- "transporter", "transporters", "transport company", "transport wala" = "transporter".
- "broker", "brokers" = "broker".
- Keep the city name exactly as spoken, with normal capitalization.
- If city or category is missing, return an empty string.

User request:
${message}

Return exactly:
{
  "city": "",
  "category": ""
}`,

        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    const cleanResponse = data.response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanResponse);

    let state = "";

    // 2. City mil gayi to existing location API se state find karo
    if (parsed.city) {
      const locationResponse = await fetch(
        `${RODIO_API_BASE_URL}/api/location/search?query=${encodeURIComponent(parsed.city)}`
      );

      if (locationResponse.ok) {
        const locationData = await locationResponse.json();

        if (locationData.data?.length > 0) {
          state = locationData.data[0].state || "";
        }
      }
    }

    // 3. Final structured query
    return {
      state,
      city: parsed.city || "",
      category: parsed.category || ""
    };

  } catch (error) {
    console.error("Query parser error:", error.message);
    throw error;
  }
}