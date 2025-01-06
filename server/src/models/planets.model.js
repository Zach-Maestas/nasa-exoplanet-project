import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';
import planets from './planets.mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadPlanetsData() {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'kepler_data.csv');
    const readableStream = fs.createReadStream(dataPath);
    const parser = parse({
        comment: '#',
        columns: true
    });

    return new Promise((resolve, reject) => {
        readableStream
            .pipe(parser)
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.error('Error while reading file:', err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound} habitable planets found.`);
                resolve();
            });
    });
}

function isHabitablePlanet(planet) {
    return planet.koi_disposition === 'CONFIRMED' &&
        planet.koi_insol > 0.36 && planet.koi_insol < 1.11 &&
        planet.koi_prad < 1.6;
}

export async function getAllPlanets() {
    return await planets
        .find({}, {'_id': 0, '__v': 0});
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        }, {
            upsert: true,
        });
    } catch (err) {
        console.error(`Could not save planet ${planet.kepler_name} because: ${err}`);
    }
}
