const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token = null;
    console.log("token is",token);

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    console.log("header",authHeader);

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. If not found, check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login First",
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = auth;