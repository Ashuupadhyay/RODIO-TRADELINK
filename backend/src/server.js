require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = require("./app");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const businessRoute = require("./routes/businessrout");
const searchRoutes = require("./routes/vichlesearch");

// Database
const connectDB = require("./config/db");


// Middlewares
app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// API Routes
app.use("/api/booking", bookingRoutes);

app.use("/api/business", searchRoutes);

app.use("/api/business", businessRoute);


// Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server Running on ${PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
};


startServer();