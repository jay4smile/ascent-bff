import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

describe('Solution', () => {
    let app: ArchitectureMapperBffApplication;
    let client: Client;
    const testSolutionId = "test-solution"

    before('setupApplication', async () => {
        ({ app, client } = await setupApplication());
    });

    after(async () => {
        await app.stop();
    });

    it('GET solution count', async () => {
        await client
            .get('/solutions/count')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(/{"count":\d+}/);
    });

    it('GET all solution', async () => {
        await client
            .get('/solutions')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('POST a solution', async () => {
        await client
            .post('/solutions').send({
                "id": testSolutionId,
                "name": "Test Solution"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('GET solution by id', async () => {
        await client
            .get(`/solutions/${testSolutionId}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('PATCH a solution', async () => {
        await client
            .patch(`/solutions/${testSolutionId}`).send({
                "name": "Test name updated"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then((res) => {
              expect(res.body).to.containEql({'name': 'Test name updated'});
            });
    });

    it('DELETE a solution', async () => {
        await client
            .delete(`/solutions/${testSolutionId}`)
            .expect(204);
    });

    it('PATCH all solution', async () => {
        await client
            .patch(`/solutions`).send({
                "name": "Test name updated"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(/{"count":\d+}/);
    });

});
