import mongoose from "mongoose";
import app from "./app";

console.log("MONGO URI =>", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`),
    );
  })
  .catch(console.error);
