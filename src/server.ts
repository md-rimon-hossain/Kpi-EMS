import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

async function main() {
  try {
    await mongoose.connect(config.MONGODB_URI as string);

    app.listen(config.PORT, () => {
      console.log(`Server is running on port http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

