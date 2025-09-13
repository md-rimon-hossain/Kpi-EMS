import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

async function startServer() {
  try {
    await mongoose.connect(config.MONGODB_URI as string);

    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
