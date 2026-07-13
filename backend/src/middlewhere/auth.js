const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {

    // Token variable
    let token;
    console.log("token is",token);
    // Authorization Header
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    // Header se token nikalo
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Cookie se token nikalo
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // Final token print
    console.log("Final Token:", token);

    // Token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login First",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded User:", decoded);

    // User ko request me save karo
    req.user = decoded;

    next();

  } catch (error) {

    console.log("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = auth;