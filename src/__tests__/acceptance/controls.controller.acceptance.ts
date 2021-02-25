import { Client } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Controls', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;
  const testControlId = "TEST-1"

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET controls count', async () => {
    await client
      .get('/controls/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/)
  });

  it('GET all controls', async () => {
    await client
      .get('/controls')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST a control', async () => {
    await client
      .post('/controls').send({
        "control_id": testControlId,
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
  });

  it('GET control by id', async () => {
    await client
      .get(`/controls/${testControlId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('PATCH a control', async () => {
    await client
      .patch(`/controls/${testControlId}`).send({
        "comment": "test comment updated"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{.*"comment":"test comment updated".*}/);
  });

  it('DELETE a control', async () => {
    await client
      .delete(`/controls/${testControlId}`)
      .expect(204);
  });

  it('PATCH all controls', async () => {
    await client
      .patch(`/controls`).send({
        "comment": "test comment updated"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/);
  });

});
