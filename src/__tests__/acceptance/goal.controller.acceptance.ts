import { Client } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

describe('Goals', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET goal count', async () => {
    await client
      .get('/goals/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/)
  });

  it('GET all goal', async () => {
    await client
      .get('/goals')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('GET goal by id', async () => {
    await client
      .get('/goals/3000010')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

});
