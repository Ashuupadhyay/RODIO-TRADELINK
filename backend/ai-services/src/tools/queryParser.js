import "dotenv/config";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const RODIO_API_BASE_URL = process.env.RODIO_API_BASE_URL;

export async function parseDirectoryQuery(message) {
  try {
    // Qwen sirf category identify karega
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen2.5:0.5b",

        prompt: `You are a Rodio Tradelink query parser.

Extract ONLY the category from the user's request.

Allowed categories:
- transporter
- broker
- fleet_owner
- driver
- vehicle_owner

Rules:
- transport
- transporter
- transporters
- transport company
- transport wala
- truck transport
- logistics transport

must return exactly:
transporter

If user says broker or brokers, return exactly:
broker

Return ONLY one category word.
Do not return JSON.
Do not return explanation.

User request:
${message}

Category:`,

        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    const categoryText = data.response
      .trim()
      .toLowerCase();

    // Category normalize
    let category = "";

    if (
      categoryText.includes("transporter") ||
      categoryText.includes("transport")
    ) {
      category = "transporter";
    } else if (categoryText.includes("broker")) {
      category = "broker";
    } else if (categoryText.includes("fleet")) {
      category = "fleet_owner";
    } else if (categoryText.includes("driver")) {
      category = "driver";
    } else if (categoryText.includes("vehicle")) {
      category = "vehicle_owner";
    }

    // Simple city extraction
    const cityMatch = message.match(
      /(?:in|at|from|for|ke|ki|ka)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
    );

    let city = cityMatch ? cityMatch[1].trim() : "";

    // Common Hinglish pattern:
    // "Indore ke transporter"
    if (!city) {
      const hinglishMatch = message.match(
        /^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:ke|ki|ka)\s+/i
      );

      if (hinglishMatch) {
        city = hinglishMatch[1].trim();
      }
    }

    let state = "";

    // Existing Rodio Location API se state find karo
    if (city && RODIO_API_BASE_URL) {
      const locationResponse = await fetch(
        `${RODIO_API_BASE_URL}/api/location/search?query=${encodeURIComponent(
          city
        )}`
      );

      if (locationResponse.ok) {
        const locationData = await locationResponse.json();

        if (locationData.data?.length > 0) {
          const exactCity = locationData.data.find(
            (item) =>
              item.name?.toLowerCase() === city.toLowerCase()
          );

          const location = exactCity || locationData.data[0];

          city = location.name || city;
          state = location.state || "";
        }
      }
    }

    return {
      state,
      city,
      category
    };
  } catch (error) {
    console.error("Query parser error:", error.message);
    throw error;
  }
}