import axios from 'axios';
import launchesDatabase from './launches.mongo.js';
import planets from './planets.mongo.js';

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query';

const launch = {
    flightNumber: 100, // flight_number
    mission: 'Kepler Exploration X', // name
    rocket: 'Explorer IS1', // rocket.name 
    launchDate: new Date('December 27, 2030'), // date_local
    target: 'Kepler-442 b', // N/A
    customers: ['NASA', 'ZTM'], // payload.customers for each payload
    upcoming: true, // upcoming
    success: true, // success
};

saveLaunch(launch);

export async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if (firstLaunch) {
        console.log('Launch data already loaded');
        return;
    } else {
        await populateLaunches();
    }
}

async function populateLaunches() {
    console.log('Downloading launch data...');
    const res = await querySpaceXLaunches();

    const launchDocs = res.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc.payloads;
        const customers = payloads.flatMap((payload) => {
            return payload.customers;
        });

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket.name,
            launchDate: new Date(launchDoc.date_local),
            upcoming: launchDoc.upcoming,
            success: launchDoc.success,
            customers,
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function querySpaceXLaunches() {
    try {
        return await axios.post(SPACEX_URL, {
            query: {},
            options: {
                pagination: false,
                populate: [
                    {
                        path: 'rocket',
                        select: {
                            name: 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            customers: 1
                        }
                    }
                ]
            }
        });
    } catch (err) {
        throw new Error('Failed to load launch data');
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

export async function existsLaunchWithId(launchId) {
    return await findLaunch({
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

export async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found');
    }
    
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

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

export async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne(
        { flightNumber: launchId },
        { $set: { upcoming: false, success: false } }
    );

    return aborted.matchedCount === 1; // Return true if a document was matched
}