require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`ShelfLife API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start ShelfLife API:", error);
    process.exit(1);
  }
}

startServer();
