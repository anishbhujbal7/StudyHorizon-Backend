const express = require("express");
const app = express();
const fileUpload = require("express-fileupload"); 

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
// const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Connect to DB
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Enable file upload with temp file support
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Optional: CORS if frontend is on another domain
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// Connect to Cloudinary
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
