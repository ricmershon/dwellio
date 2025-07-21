import mongoose from "mongoose";

let connected = false;

const dbConnect = async () => {
    mongoose.set('strictQuery', true);

    // If database already connected then don't connect again
    if (connected) {
        console.log('>>> MongoDB already connected.');
        return;
    }

    try {
        const database = process.env.MONGODB_URI!;
        
        await mongoose.connect(database)
        connected = true;
        console.log('>>> Connected to database:\n', database);
    } catch (error) {
        throw new Error(`>>> Error connecting to database: ${error}`)
    }
}

export default dbConnect;