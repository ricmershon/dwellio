import mongoose from "mongoose";

// One-time connection error logging.
if (!mongoose.connection.listeners('error').length) {
    mongoose.connection.on('error', (error) => {
        console.error('[mongo] connection error:', error?.message || error);
    });
}

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
}

declare global {
    // eslint-disable-next-line no-var
    var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

if (!global._mongoose) {
    global._mongoose = {
        conn: null,
        promise: null
    };
}

const dbConnect = async () => {
    if (global._mongoose!.conn) {
        console.log(">>> MongoDB already connected.");
        return global._mongoose!.conn;
    }

    if (!global._mongoose!.promise) {
        mongoose.set("strictQuery", true);
        mongoose.set("bufferCommands", false); // fail fast instead of buffering forever

        global._mongoose!.promise = mongoose.connect(MONGODB_URI!, {
            serverSelectionTimeoutMS: 15000,  // give Atlas more time on cold start
            appName: "dwellio",
        })
        .then(() => mongoose);
    }

    global._mongoose!.conn = await global._mongoose!.promise;
    return global._mongoose!.conn;
}

export default dbConnect;