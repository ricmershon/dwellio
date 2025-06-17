import mongoose from "mongoose";

let connected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    // If database already connected then don't connect again
    if (connected) {
        console.log('>>> MongoDB already connected.');
        return;
    }

    try {
        const database = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.xc2q6sx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster1`;
        await mongoose.connect(database)
        connected = true;
        console.log('>>> Connected to database:\n', database);
    } catch (error) {
        console.log('>>> Error connecting to database:\n ', error);
    }
}

export default connectDB;