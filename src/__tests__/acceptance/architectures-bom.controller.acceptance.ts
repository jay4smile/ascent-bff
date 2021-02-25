import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Architecture Bom', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;
  const testArchId= 'arch01';
  const testBomId= 'test_service';

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('POST a architecture bom', async () => {
    await client
      .post(`/architectures/${testArchId}/boms`).send({
        "ibm_service": testBomId,
        "desc": "string",
        "deployment_method": "string",
        "compatibility": "string",
        "catalog_link": "string",
        "documentation": "string",
        "hippa_compliance": "string",
        "availability": "string",
        "remarks": "string",
        "provision": "string",
        "automation": "string",
        "hybrid_option": "string"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.containEql({'ibm_service': 'test_service'});
      });
  });

  it('GET a bom from reference architecture id', async () => {
    await client
      .get(`/architectures/${testArchId}/boms`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('PATCH a architecture', async () => {
    await client
      .patch(`/architectures/${testArchId}/boms`).send({
        "desc": "test desc updated"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/);
  });

  it('DELETE a architecture', async () => {
    await client
      .delete(`/architectures/${testArchId}/boms`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/);
  });

});
