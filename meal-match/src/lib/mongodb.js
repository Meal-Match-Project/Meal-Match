import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  if (!MONGODB_URI) {
    console.error("MongoDB URI is missing from environment variables!");
    throw new Error("MongoDB URI is missing!");
  }

  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }

  if (connectionState === 2) {
    console.log("MongoDB is connecting...");
    return;
  }

  try {
    mongoose.connect(MONGODB_URI, {
      dbName: "meal-match-database",
      bufferCommands: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error: ", err);
    throw new Error("Database connection failed!");
  }
};

export default connect;
