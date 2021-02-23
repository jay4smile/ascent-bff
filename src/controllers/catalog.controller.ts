import {  
    param,
    get,  
    response,
  } from '@loopback/rest';
  import fetch from 'cross-fetch';
  
  export class CatalogController {
    @get('/catalog')
    @response(200, {
      description: 'Catalog',
      content: 'application/json'
    })
    async catalog(): Promise<JSON> {    
         
      const url = new URL('https://globalcatalog.cloud.ibm.com/api/v1?_limit=100&complete=false');       
      const res = await fetch( url.toString() );
       
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
  