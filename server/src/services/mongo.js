import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('Mongoose Connected...');
});

mongoose.connection.on('error', (error) => {
    console.error(error);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    mongoose.disconnect();
}

export { mongoConnect, mongoDisconnect };