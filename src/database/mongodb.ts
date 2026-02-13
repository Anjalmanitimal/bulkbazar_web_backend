import mongoose from "mongoose";

export const connectDatabaseTest = async () => {
  const uri = process.env.MONGO_TEST_URI;

  if (!uri) {
    throw new Error("MONGO_TEST_URI not defined");
  }

  await mongoose.connect(uri);
};
