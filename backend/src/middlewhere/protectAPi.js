const allowedOrigins = [
  "https://www.rodiotradelink.com",
  "https://rodiotradelink.com",
  "https://rodio-tradelink.onrender.com",
   "https://www.rodio-tradelink.onrender.com",
];

const protectApi = (req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  const originAllowed = allowedOrigins.includes(origin);

  const refererAllowed = allowedOrigins.some(
    (allowedOrigin) =>
      referer && referer.startsWith(`${allowedOrigin}/`)
  );

  if (!originAllowed && !refererAllowed) {
    return res.status(404).send("Not Found");
  }

  next();
};

module.exports = protectApi;