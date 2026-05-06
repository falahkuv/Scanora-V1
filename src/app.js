require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const healthRoutes = require("./routes/healthRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null
  });
});

app.use(errorHandler);

module.exports = app;
