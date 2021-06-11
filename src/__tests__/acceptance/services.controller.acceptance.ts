import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Services', () => {
    let app: ArchitectureMapperBffApplication;
    let client: Client;
    const testServiceId = "test.service"

    before('setupApplication', async () => {
        ({ app, client } = await setupApplication());
    });

    after(async () => {
        await app.stop();
    });

    it('GET services count', async () => {
        await client
            .get('/services/count')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(/{"count":\d+}/);
    });

    it('GET all services', async () => {
        await client
            .get('/services')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('POST a service', async () => {
        await client
            .post('/services').send({
                "service_id": testServiceId,
                "grouping": "string",
                "ibm_catalog_service": "string",
                "desc": "string",
                "deployment_method": "string",
                "fs_validated": true,
                "compliance_status": "string",
                "provision": "string",
                "cloud_automation_id": "string",
                "hybrid_automation_id": "string",
                "_id": "string"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('GET service by id', async () => {
        await client
            .get(`/services/${testServiceId}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    it('PATCH a service', async () => {
        await client
            .patch(`/services/${testServiceId}`).send({
                "desc": "test desc updated"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .then((res) => {
              expect(res.body).to.containEql({'desc': 'test desc updated'});
            });
    });

    it('DELETE a service', async () => {
        await client
            .delete(`/services/${testServiceId}`)
            .expect(204);
    });

    it('PATCH all services', async () => {
        await client
            .patch(`/services`).send({
                "desc": "test desc updated"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(/{"count":\d+}/);
    });

});
