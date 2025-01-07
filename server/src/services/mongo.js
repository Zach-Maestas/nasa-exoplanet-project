import mongoose from "mongoose";

const MONGO_URL = 'mongodb+srv://zacharymaestas03:Z091303m%21%40@exoplanets.f9dv7.mongodb.net/nasa?retryWrites=true&w=majority&appName=Exoplanets';

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