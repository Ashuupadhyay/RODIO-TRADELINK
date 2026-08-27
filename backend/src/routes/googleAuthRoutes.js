const express = require("express");
const router = express.Router();

const {
  getGoogleAuth,
  SCOPES,
} = require("../services/googleSheetSync/googleSheetService");

const auth = getGoogleAuth();

router.get("/google", (req, res) => {
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  res.redirect(authUrl);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    const { tokens } = await auth.getToken(code);

    console.log("GOOGLE TOKENS:", tokens);

    res.send("Google authorization successful. Check backend console.");
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).send("Google authorization failed");
  }
});

module.exports = router;