require("dotenv").config();

const app = require("./app");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const businessRoute = require("./routes/businessrout");
const searchRoutes = require("./routes/vichlesearch");
const contactRoutes = require("./routes/QueryRoute");
const transporterRoutes = require("./routes/transporter");

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