// import mongoose from "mongoose";

// // before all test starts
// beforeAll(async () => {
//   // can connect to test database or other test engines
//   await connectDb();
// });

// // after all tests are done
// afterAll(async () => {
//   await mongoose.connection.close();
// });
import { connectDatabaseTest } from "../database/mongodb";
import mongoose from "mongoose";

beforeAll(async () => {
  await connectDatabaseTest();
});

afterAll(async () => {
  await mongoose.connection.close();
});
