const allowedOrigins = [
  "https://rodiotradelink.com",
  "https://www.rodiotradelink.com",
  "https://rodio-tradelink.onrender.com",
  "https://www.rodio-tradelink.onrender.com",
    "https://rodio.in",
      "https://www.rodio.in",
];

const protectApi = (req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // API key
  const apiKey = req.headers["x-api-key"];

  // Website request
  const websiteAllowed =
    allowedOrigins.includes(origin) ||
    allowedOrigins.some(
      (url) => referer && referer.startsWith(`${url}/`)
    );

  // Website ko allow karo
  if (websiteAllowed) {
    return next();
  }

  // Postman / React Native / trusted app
  if (
    apiKey &&
    process.env.DIRECTORY_API_KEY &&
    apiKey === process.env.DIRECTORY_API_KEY
  ) {
    return next();
  }

  // Baaki sab block
  return res.status(404).send("Not Found");
};

module.exports = protectApi;