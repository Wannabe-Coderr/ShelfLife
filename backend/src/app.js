const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/members");
const borrowRoutes = require("./routes/borrow");

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShelfLife backend is healthy.",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api", borrowRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
