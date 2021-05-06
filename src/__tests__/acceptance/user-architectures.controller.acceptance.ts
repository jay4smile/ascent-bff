import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('UserArchitectures', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET user-architectures count', async () => {
    await client
      .get('/user-architectures/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/)
  });

  it('GET all user-architectures', async () => {
    await client
      .get('/user-architectures')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST, GET, PATCH, then DELETE a user-architecture', async () => {
    let id = "";
    await client
      .post('/user-architectures').send({
        "email": "john.doe@ibm.com",
        "arch_id": "dev-env"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        id = res.body.id;
      });
    await client
      .get(`/user-architectures/${id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    await client
      .patch(`/user-architectures/${id}`).send({
        'email': 'john.doe2@ibm.com'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.containEql({'email': 'john.doe2@ibm.com'});
      });
    await client
      .delete(`/user-architectures/${id}`)
      .expect(204);
  });

});
