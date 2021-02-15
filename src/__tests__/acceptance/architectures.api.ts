import {Client, expect} from '@loopback/testlab';
import {ArchitectureMapperBffApplication} from '../..';
import {setupApplication} from './test-helper';

describe('Architectures', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('exposes a default home page', async () => {
    await client
      .get('/architectures')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

});
