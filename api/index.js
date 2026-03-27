import dotenv from "dotenv";
dotenv.config();
import serverless from "serverless-http";

import app from "../src/app.js";
import { connectDB } from "../connection.js";

// Top-level await for Vercel functions to ensure DB is ready before request processing
// (Requires Node 14.8+ or ESM which we have)
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("DB Connected in Vercel");
  }
  return app(req, res);
};

export default serverless(handler);
