import { getAllLaunches, addNewLaunch, abortLaunchById, existsLaunchWithId } from '../../models/launches.model.js';

export async function httpGetAllLaunches(req, res){
    return res.status(200).json(await getAllLaunches());
}

export function httpAddNewLaunch(req, res){
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate ||
         !launch.target
    ) {
        return res.status(400).json({
            error: 'Missing Required Launch Property'
        });
    }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid Launch Date',
        })
    }

    addNewLaunch(launch);
    return res.status(201).json(launch);
}

export async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);
    if (!existsLaunchWithId(launchId)){
        return res.status(404).json({
            error: 'Launch not found',
        })
    }
    
    const aborted = abortLaunchById(launchId);
    return res.status(200).json(aborted);
}
