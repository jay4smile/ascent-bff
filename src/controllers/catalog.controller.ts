import {  
    param,
    get,  
    response,      
  } from '@loopback/rest';
import { request } from 'express';
import path from 'path';
  //import fetch from 'cross-fetch';
  import fetch from 'node-fetch';
  import * as redis from "redis";
import { promisify } from 'util';
import { any } from 'nconf';
//import { Request, get } from '@loopback/rest';
//import { request } from 'express';
  export class CatalogController {
    
    
    @get('/catalog')    
    async catalog(): Promise<any> { 
      
      var redisClient = redis.createClient(6379, "127.0.0.1");  
      const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false');      
      const key = "catalog1";
        
      return redisClient.get(key, (error: any, data: any) => {          
         if (data) {           
           console.log("***yks****"+data);                 
           return data;        
         } else{           
           return fetch(url.toString())
            .then(response => response.json())
            .then(data => {            
            console.log("****data*****"+data);
            //redisClient.set("catalog",data);
            return data;
      }).catch(err => {        
         return err;
       });
     }    
   });  
  }

  
    @get('/catalog/{id}')
    @response(200, {
      description: 'Catalog by id',
      content: 'application/json'
    })
    async catalogById(
      @param.path.string('id') id: string    
    ): Promise<JSON> {      
      const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false&q='+id);      
      const res = await fetch( url.toString() );
       
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }      
      const data = await res.json();             
       return data;    
    }  
  
  }
  