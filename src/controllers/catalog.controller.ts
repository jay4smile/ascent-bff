//'use warn'
import {
  param,
  get,
  response, 
} from '@loopback/rest';
import fetch from 'node-fetch';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class CatalogController {

  @get('/catalog/{offset}/{limit}')
  async catalog(
    @param.path.string('offset') offset: string,
    @param.path.string('limit') limit: string,
  ): Promise<JSON> {

    const url = new URL("https://globalcatalog.cloud.ibm.com/api/v1?_offset=" + offset + "&_limit=" + limit + "&complete=false");
    const res = await fetch(url.toString());

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    const data = await res.json();
    return data;
  }


  @get('/catalog/{id}')
  @response(200, {
    description: 'Catalog by id',
    content: 'application/json'
  })
  async catalogById(
    @param.path.string('id') id: string,
  ): Promise<any> {

    const jsonobj = [];
    const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false&q=' + id);
    const res = await fetch(url.toString());
    const data = await res.json();
    jsonobj.push(JSON.stringify(data));
      
    return jsonobj;
  }

}
