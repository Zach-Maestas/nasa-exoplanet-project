import launchesDatabase from './launches.mongo.js';
import planets from './planets.mongo.js';

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'), // Correct date format
    target: 'Kepler-442 b',
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

export function existsLaunchWithId(launchId) {
    return launches.has(launchId);
}

export async function getAllLaunches() {
    return await launchesDatabase
        .find({}, { _id: 0, __v: 0 });
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet){
        throw new Error('No matching planet was found');
    }

    await launchesDatabase.updateOne({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

export function addNewLaunch(launch) {
    latestFlightNumber += 1;
    launches.set(
        latestFlightNumber, 
        Object.assign(launch, {
            success: true,
            upcoming: true,
            customers: ['SpaceX', 'NASA'],
            flightNumber: latestFlightNumber,
        })
    );
}

export function abortLaunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}