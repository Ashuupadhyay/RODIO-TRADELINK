require("dotenv").config();


const express = require("express"); // <-- ADD THIS


const app = require("./app");

// Routes
const otpRoutes = require("./routes/otpRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const businessRoute = require("./routes/businessroutold");
/*const searchRoutes = require("./routes/vichlesearch");*/ // Fixed: Duplicate const declaration hataya
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
const vehicleSearchRoutes = require("./routes/vehicleSearchRoutes");

const businessDocumentRoutes = require("./routes/document.js");
const postRoutes = require("./routes/postRoutes");
const adminDocumentRoutes = require(
  "./routes/adminDocumentRoutes"
);
const cron = require("node-cron");
const expireSubscriptions = require("./services/subscriptionExpiry");
const subscriptionRoutes = require("./routes/subscription");
// Database
const connectDB = require("./config/db");

const profileRoutes = require("./routes/profile");
const userRoutes = require("./routes/userRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

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
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/businesses", searchRoutes);

// Vehicle routes in correct sequence
app.use("/api/vehicles", vehicleSearchRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.use("/api/routes", routeRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/business", workingAreaRoutes);
app.use("/api/receipt", receiptRoutes);
// Fixed: Niche se extra duplicate vehicleSearchRoutes hata diya

app.use("/api/documents", businessDocumentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payout", payoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUserRoutes);
app.use(
  "/api/admin",
  adminDocumentRoutes
);

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     try {
//         await connectDB();

//         app.listen(PORT, "0.0.0.0", () => {
//             console.log(`Server Running on ${PORT}`);
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };
// cron.schedule("*/10 * * * *", async () => {
//   console.log("🔄 Running subscription expiry check...");

//   const result = await expireSubscriptions();

//   console.log("Subscription expiry result:", result);
// });

// startServer();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected");

    // ==========================================
    // CHECK EXPIRY ON SERVER START
    // ==========================================

    await expireSubscriptions();

    // ==========================================
    // CHECK EVERY 10 MINUTES
    // ==========================================

    cron.schedule("*/10 * * * *", async () => {
      console.log(
        "🔄 Running subscription expiry check..."
      );

      try {
        const result = await expireSubscriptions();

        console.log(
          "Subscription expiry result:",
          result
        );
      } catch (error) {
        console.error(
          "Subscription expiry cron error:",
          error
        );
      }
    });

    // ==========================================
    // START SERVER
    // ==========================================

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server Running on ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();