import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Control Nist', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET all control mappings', async () => {
    await client
      .get('/control-mapping')
      .query({filter: {
        limit:50
      }})
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('GET controls impacting a service', async () => {
    await client
      .get('/services/cloud-object-storage/controls')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('GET services impacted by a control', async () => {
    await client
      .get('/controls/AC-3 (2)/services')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST a control mapping', async () => {
    await client
      .post('/control-mapping').send({
        "control_id": "SI-11",
        "arch_id": "simple",
        "compliant": "UNKNOWN",
        "configuration": "string",
        "evidence": "string",
        "desc": "string",
        "comment": "string"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('GET architectures impacted by a control', async () => {
    await client
      .get('/controls/SI-11/architectures')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.length).to.equal(1);
      });
  });

  it('DELETE a control mapping', async () => {
    await client
      .delete('/control-mapping').send({
        "control_id": "SI-11",
        "arch_id": "simple"
      })
      .expect(200)
      .expect(/{"count":\d+}/);
  });

});
