const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {

    let token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Login First"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid Token"
        });

    }

};

module.exports = auth;