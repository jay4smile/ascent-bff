//'use warn'
import {
    param,
    get,
    response, RestBindings, Response,
} from '@loopback/rest';
import path from 'path';
import fetch from 'node-fetch';
import * as redis from "redis";
import { Tedis, TedisPool } from "tedis";
import { any } from 'nconf';
import {inject} from "@loopback/core";
export class CatalogController {

    @get('/catalog')
    async catalog(
        @inject(RestBindings.Http.RESPONSE) res: Response,
    ): Promise<any> {

        
        let tedis = new Tedis({
            port: 6379,
            host: "127.0.0.1"
          });

          const pool = new TedisPool({
            port: 6379,
            host: "127.0.0.1"
          });

          tedis = await pool.getTedis();           
          pool.putTedis(tedis);

          const jsonobj = [];
          const key = "catalog";        
          
          try {            
          
          if(await tedis.exists(key) != 0){
            const data = await tedis.get(key);            
            console.log("data retrieved from the cache");                                   
            jsonobj.push(data);            
          } else{
            const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false');  
            const data  = await fetch( url.toString() );
            await tedis.setex(key, 28800,JSON.stringify(data));                        
            const jdata = await data.json();                        
            console.log("cache miss"); 
            jsonobj.push(data);

          }
        } catch (error) {
            res.status(400).send(error);  
        }
          res.status(200).send(jsonobj);       

   }

    @get('/catalog/{id}')
    @response(200, {
      description: 'Catalog by id',
      content: 'application/json'
    })
    async catalogById(
        @param.path.string('id') id: string,
    ): Promise<JSON> {

      const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false&q='+id);
      const res  = await fetch( url.toString() );

      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      const data = await res.json();
      return data;
    }

  }
