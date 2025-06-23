import mongoose from "mongoose";

let connected = false;

// TODO: Research better way to persist db connection
const dbConnect = async () => {
    mongoose.set('strictQuery', true);

    // If database already connected then don't connect again
    if (connected) {
        console.log('>>> MongoDB already connected.');
        return;
    }

    try {
        const database = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster1.xc2q6sx.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority&appName=Cluster1`;
        
        await mongoose.connect(database)
        connected = true;
        console.log('>>> Connected to database:\n', database);
    } catch (error) {
        throw new Error(`>>> Error connecting to database: ${error}`)
    }
}

export default dbConnect;