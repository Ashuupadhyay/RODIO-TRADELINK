require("dotenv").config();

const app = require("./app");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const businessRoute = require("./routes/businessroutold");
/*const searchRoutes = require("./routes/vichlesearch");*/
const contactRoutes = require("./routes/QueryRoute");
const transporterRoutes = require("./routes/transporter");
const commentRoutes = require("./routes/comment");
const bidRoutes = require("./routes/bidRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboard");
const updateProfileRoutes = require("./routes/updateProfileRoutes");

const businessRoutes = require("./routes/businessroute");
const vehicleRoutes = require("./routes/vechlerout");
const routeRoutes = require("./routes/ruteroute");
const locationRoutes = require("./routes/locationRoutes");
const directoryRoutes = require("./routes/DIRECTORY.JS");
const workingAreaRoutes = require("./routes/workingAreaRoutes");
const receiptRoutes = require("./routes/reciptrout");
const searchRoutes = require("./routes/searchRoutes");



const businessDocumentRoutes =
  require("./routes/document.js");




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
app.use("/api", dashboardRoutes);
app.use("/api/update-profile", updateProfileRoutes);


app.use("/api/business", businessRoutes);
app.use("/api/v1/businesses", searchRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/routes", routeRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/business", workingAreaRoutes);
app.use("/api/receipt", receiptRoutes);

app.use(
  "/api/documents",
  businessDocumentRoutes
);
app.use("/api/directory", directoryRoutes);
//const paymentRoutes = require("./routes/paymentRoutes")
//app.use("/api/payment", paymentRoutes);


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