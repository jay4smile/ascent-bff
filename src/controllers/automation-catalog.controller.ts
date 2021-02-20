// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {get} from "@loopback/rest";

export class AutomationCatalogController {
  @get('/catalog')
  catalog(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    // Load the Catalog using the Catalog Class

    // Then output the Catalog in JSON


    return {'status':"UP"};



  }

  @get('/automation/{bomid}')
  automationBuilder(): object {

    // Read Architecture Bill of Materials

    // Load Service Map to the Bill Materials

    // Load Catalog

    // Map Builder BOM to Automation Catalog creating a Automation BOM

    // Build Terraform Components

    // Write into a Buffer

    // Build Zipfile

    https://www.archiverjs.com/zip-stream/

    // Stream Buffer back

    // Future : Push to Object Store, Git, Create a Tile Dynamically

        return {'status':"UP"};
  }

  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml


    return {'status':"UP"};



  }

}
