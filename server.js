import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { current, mode } from "./src/config/config.js";
import { connectDB, sequelize } from "./connection.js";

const startServer = async () => {
  try {
    const portValue = process.env.PORT || current.server.port || 3000;
    const PORT = parseInt(portValue);

    app.listen(PORT, async () => {
      console.log(`-----------------------------------------`);
      console.log(`🚀 QPAY API IS RUNNING ON PORT: ${PORT}`);
      console.log(`🌐 Mode: ${mode}`);
      console.log(`-----------------------------------------`);
      if (mode === "development") {
        await sequelize.sync();
      }
      await connectDB();
    });
  } catch (error) {
    console.error("Critical server startup error:", error);
  }
};

startServer();
