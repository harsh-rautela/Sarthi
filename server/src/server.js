import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET)
  throw new Error("JWT_SECRET missing. Copy .env.example to .env");
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gov_scheme_portal",
);
app.listen(port, () =>
  console.log(`SchemeSathi API running on http://localhost:${port}`),
);
