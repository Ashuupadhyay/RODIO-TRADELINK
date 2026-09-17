import "dotenv/config";
const RODIO_API_BASE_URL = process.env.RODIO_API_BASE_URL;

export async function searchDirectory({
  state,
  city,
  category
}) {
  try {
    const params = new URLSearchParams();

    if (state) params.append("state", state);
    if (city) params.append("city", city);
    if (category) params.append("category", category);
console.log("RODIO API URL:", RODIO_API_BASE_URL);
    const url = `${RODIO_API_BASE_URL}/api/business/search?${params.toString()}`;
console.log("RODIO API URL:", RODIO_API_BASE_URL);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Rodio API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Directory tool error:", error.message);
    throw error;
  }
}