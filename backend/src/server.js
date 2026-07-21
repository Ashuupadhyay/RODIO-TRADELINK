require("dotenv").config();

const app = require("./app");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const businessRoute = require("./routes/businessrout");
const searchRoutes = require("./routes/vichlesearch");
const contactRoutes = require("./routes/QueryRoute");
const transporterRoutes = require("./routes/transporter");
const commentRoutes = require("./routes/comment");
const bidRoutes = require("./routes/bidRoutes");
const paymentRoutes = require("./routes/paymentRoutes");



// Database
const connectDB = require("./config/db");

const profileRoutes = require("./routes/profile");

/*
    API Routes
*/

app.use("/api/booking", bookingRoutes);

app.use("/api/business", searchRoutes);


app.use("/api/business", businessRoute);
app.use("/api/contact", contactRoutes);
app.use("/api/query", require("./routes/ecel"));
app.use("/api/transporters", transporterRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/payment", paymentRoutes);


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