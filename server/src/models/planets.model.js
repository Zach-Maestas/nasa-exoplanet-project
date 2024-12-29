import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const habitablePlanets = [];

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
            .on('data', (data) => {
                if (isHabitablePlanet(data)) {
                    habitablePlanets.push(data);
                }
            })
            .on('error', (err) => {
                console.error('Error while reading file:', err);
                reject(err);
            })
            .on('end', () => {
                console.log(`${habitablePlanets.length} habitable planets found.`);
                resolve(habitablePlanets); // Correct use of resolve
            });
    });
}

function isHabitablePlanet(planet) {
    return planet.koi_disposition === 'CONFIRMED' &&
           planet.koi_insol > 0.36 && planet.koi_insol < 1.11 &&
           planet.koi_prad < 1.6;
}

export function getAllPlanets(){
    return habitablePlanets;
}
