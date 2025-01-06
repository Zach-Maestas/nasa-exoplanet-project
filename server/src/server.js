import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { loadPlanetsData } from './models/planets.model.js';

const PORT = process.env.PORT || 8000;

const MONGO_URL = 'mongodb+srv://zacharymaestas03:Z091303m%21%40@exoplanets.f9dv7.mongodb.net/nasa?retryWrites=true&w=majority&appName=Exoplanets';

const server = http.createServer(app);

mongoose.connection.once('open', () => {
    console.log('Mongoose Connected...');
});

mongoose.connection.on('error', (error) => {
    console.error(error);
});

async function startServer() {
    await mongoose.connect(MONGO_URL);
    await loadPlanetsData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    });
}

startServer();