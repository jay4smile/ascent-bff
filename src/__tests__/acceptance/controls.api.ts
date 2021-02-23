import {Client} from '@loopback/testlab';
import {ArchitectureMapperBffApplication} from '../..';
import {setupApplication} from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Controls', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('Get controls count', async () => {
    await client
      .get('/controls/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/gm)
  });

  it('Get all controls', async () => {
    await client
      .get('/controls')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST and DELETE a control', async () => {
    await client
      .post('/controls').send({
        "control_id": "TEST-1",
        "control_family": "test control_family",
        "cf_description": "test cf_description",
        "base_control": true,
        "control_name": "test control_name",
        "control_description": "test control_description",
        "guidance": "test guidance",
        "parameters": "test parameters",
        "candidate": "test candidate",
        "comment": "test comment",
        "inherited": "test inherited",
        "platform_responsibility": "test platform_responsibility",
        "app_responsibility": "test app_responsibility"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);
      await client
      .delete('/controls/TEST-1')
      .expect(204);
  });

});
