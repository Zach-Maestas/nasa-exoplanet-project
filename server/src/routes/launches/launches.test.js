import request from 'supertest';
import app from '../../app.js';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';
import { loadPlanetsData } from '../../models/planets.model.js';

describe('Launches API', () => {

    const LAUNCHES_PATH = '/v1/launches';

    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('Should response with 200 success', async () => {
            const response = await request(app)
                .get(LAUNCHES_PATH)
                .expect('Content-Type', /json/);
            expect(response.statusCode).toBe(200);
        });
    });

    describe('Test POST /launch', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: '2022-10-13',
        }

        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        }

        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'zoot',
        };

        test('Should response with 201 created', async () => {
            const response = await request(app)
                .post(LAUNCHES_PATH)
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('Should catch missing required properties', async () => {
            const response = await request(app)
                .post(LAUNCHES_PATH)
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing Required Launch Property',
            });
        });

        test('Should catch invalid dates', async () => {
            const response = await request(app)
                .post(LAUNCHES_PATH)
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: 'Invalid Launch Date',
            });
        });
    });
});