const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const authRoutes = require("./routes/authrout");




const app = express();   // ✅ Pehle app banao

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Uske baad routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TradLink Backend Running..."
    });
});


/*app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});*/
module.exports = app;