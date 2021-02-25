import { Client, expect } from '@loopback/testlab';
import { ArchitectureMapperBffApplication } from '../..';
import { setupApplication } from './test-helper';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Bom', () => {
  let app: ArchitectureMapperBffApplication;
  let client: Client;
  const testBom = 'test_service'
  let testBomId = '000'

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('GET boms count', async () => {
    await client
      .get('/boms/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/);
  });

  it('GET all boms', async () => {
    await client
      .get('/boms')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('POST, GET, PATCH, then DELETE a bom', async () => {
    await client
      .post('/boms').send({
        'ibm_service': testBom,
        'desc': 'string',
        'deployment_method': 'string',
        'compatibility': 'string',
        'catalog_link': 'string',
        'documentation': 'string',
        'hippa_compliance': 'string',
        'availability': 'string',
        'remarks': 'string',
        'provision': 'string',
        'automation': 'string',
        'hybrid_option': 'string',
        'arch_id': 'string'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        testBomId = res.body._id;
      });
    await client
      .get(`/boms/${testBomId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    await client
      .patch(`/boms/${testBomId}`).send({
        'desc': 'test desc updated'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.containEql({'desc': 'test desc updated'});
      });
    await client
      .delete(`/boms/${testBomId}`)
      .expect(204);
  });

  it('PATCH all boms', async () => {
    await client
      .patch(`/boms`).send({
        'desc': 'test desc updated'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(/{"count":\d+}/);
  });

});
