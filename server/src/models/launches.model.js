import launchesDatabase from './launches.mongo.js';
import planets from './planets.mongo.js';

const DEFAULT_FLIGHT_NUMBER = 100;

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

export async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

export async function getAllLaunches() {
    return await launchesDatabase
        .find({}, { _id: 0, __v: 0 });
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found');
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

export async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        mission: launch.mission,
        success: true,
        upcoming: true,
        customers: ['SpaceX', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

export async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne(
        { flightNumber: launchId },
        { $set: { upcoming: false, success: false } }
    );

    return aborted.matchedCount === 1; // Return true if a document was matched
}