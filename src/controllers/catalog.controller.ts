import {
    param,
    get,
    response, RestBindings, Response,
} from '@loopback/rest';
import path from 'path';
import fetch from 'node-fetch';
import * as redis from "redis";
import { any } from 'nconf';
import {inject} from "@loopback/core";
export class CatalogController {

    @get('/catalog')
    async catalog(
        @inject(RestBindings.Http.RESPONSE) res: Response,
    ): Promise<void> {

        // Fix this to be retrieved from the Environment
        var client =  redis.createClient(6379, "127.0.0.1");
        const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false');
        const key = "catalog1";

        //log error to the console if any occurs
        client.on("error", (err) => {
            console.log(err);
        });

        try {
            client.get(key, async (err, data) => {
                if (err) throw err;

                if (data) {
                    console.log("data retrieved from the cache");
                    res.status(200).send(JSON.parse(data));
                } else {
                    fetch(url).then(async data=> {        
                        const Jdata = await data.json();                        
                        if(Jdata) {                            
                            client.setex(key, 28800, JSON.stringify(Jdata));
                            //console.log(Jdata)
                            console.log("cache miss");                            
                            res.status(200).send(Jdata);                            
                                                                               
                        } else {
                            res.status(404).send({message: "no data found"});
                        }
                                     
                    });
                }
            });
        } catch(err) {
          res.status(500).send({message: err.message});
        }

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
