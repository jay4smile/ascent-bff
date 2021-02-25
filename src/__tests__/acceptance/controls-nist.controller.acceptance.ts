import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

describe('Control Nist', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET a control nist by control id', async () => {
    await client
      .get(`/controls/AC-3/nist`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('number');
      });
  });

});
