//'use warn'
import {
  param,
  get,
  response, RestBindings, Response,
} from '@loopback/rest';
import fetch from 'node-fetch';
import { Tedis, TedisPool } from "tedis";



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

    let tedis = new Tedis({
      port: 6379,
      host: "localhost"
    });

    const jsonobj = [];
    const key = "catalog";

    try {

      if (await tedis.exists(id) !== 0) {
        const data = await tedis.get(id);
        console.log("data retrieved from the cache");
        jsonobj.push(data);
      } else {
        const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false&q=' + id);
        const res = await fetch(url.toString());
        const data = await res.json();
        await tedis.set(id, JSON.stringify(data));
        console.log("cache miss");
        jsonobj.push(data);
      }
    } catch (error) {
      throw error;
    }

    return jsonobj;
  }

}
