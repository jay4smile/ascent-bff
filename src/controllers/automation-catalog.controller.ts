// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {get} from "@loopback/rest";

export class AutomationCatalogController {
  @get('/catalog')
  catalog(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml


    return {'status':"UP"};



  }
  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml


    return {'status':"UP"};



  }

}
