require("dotenv").config();
const express = require("express");

const cors = require("cors");

//const app = express();
//const businessRoute = require("./routes/businessrout");


const app = require("./app");
const businessRoute = require("./routes/businessrout");

app.use("/api/business", businessRoute);
/*const paymentRoutes = require("./routes/paymentrout");*/

/*app.use("/api/payment", paymentRoutes);*/
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173", //"http://localhost:5173" replce true with frontend ,
    credentials: true
}));
const connectDB = require("./config/db");

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