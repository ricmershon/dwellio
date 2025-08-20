import mongoose from "mongoose";

let connected = false;

const dbConnect = async () => {
    mongoose.set("strictQuery", true);

    // If database already connected then don"t connect again
    if (connected) {
        console.log(">>> MongoDB already connected.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        connected = true;
        console.log(">>> Connected to database.");
    } catch (error) {
        throw new Error(`>>> Error connecting to database: ${error}`)
    }
}

export default dbConnect;