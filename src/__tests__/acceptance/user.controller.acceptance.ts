import { Client } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

describe('Users', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;
  const testUserId = "john.doe@ibm.com"

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET users count', async () => {
    await client
      .get('/users/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/)
  });

  it('GET all users', async () => {
    await client
      .get('/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST a user', async () => {
    await client
      .post('/users').send({
        "email": testUserId
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('GET user by id', async () => {
    await client
      .get(`/users/${testUserId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('DELETE a user', async () => {
    await client
      .delete(`/users/${testUserId}`)
      .expect(204);
  });

});
