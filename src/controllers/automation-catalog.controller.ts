// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {Inject} from 'typescript-ioc';

import {
  get,
  oas,
  param,
  Response,
  RestBindings,
} from '@loopback/rest';

import {BillOfMaterial, BillOfMaterialModel} from '@cloudnativetoolkit/iascable';
import {SingleModuleVersion, TerraformComponent} from '@cloudnativetoolkit/iascable';
import {Catalog, CatalogLoader} from '@cloudnativetoolkit/iascable';

import {ModuleSelector} from '@cloudnativetoolkit/iascable';
import {TerraformBuilder} from '@cloudnativetoolkit/iascable';
//import {TileBuilder} from '@cloudnativetoolkit/iascable';

import {inject} from "@loopback/core";

const catalogUrl = "https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml"

export class AutomationCatalogController  {

  @Inject
  loader!: CatalogLoader;
  @Inject
  moduleSelector!: ModuleSelector;
  @Inject
  terraformBuilder!: TerraformBuilder;

//  @Inject
//  tileBuilder!: TileBuilder;

  @get('/automation/catalog')
  async catalog(): Promise<object> {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    // Load the Catalog using the Catalog Class
    const catalog: Catalog = await this.loader.loadCatalog(catalogUrl);

    return {catalog};

  }

  @get('/automation/{bomid}')
  @oas.response.file()
  async downloadAutomationZip(
      @param.path.string('bomid') fileName: string,
      @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {

    // Read Architecture Bill of Materials

    // Load Service Map to the Bill Materials

    // Load Catalog

    // Map Builder BOM to Automation Catalog creating a Automation BOM

    // Build Terraform Components

    // Write into a Buffer

      //https://www.archiverjs.com/zip-stream/

    // Stream Buffer back

    // Future : Push to Object Store, Git, Create a Tile Dynamically

    const bom: BillOfMaterialModel = new BillOfMaterial("fscloud");

    bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-k8s-ocp-cluster");
    bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-ibm-cp-app-connect")

    const catalog: Catalog = await this.loader.loadCatalog(catalogUrl);

    //const filter: {platform?: string; provider?: string} =  {}; // SS explain ?

    //const billOfMaterial: BillOfMaterialModel =  await this.moduleSelector.buildBillOfMaterial(catalog, bom, filter) ;

    //if (!billOfMaterial) {
    //  throw new Error('Bill of Material is required');
    //}

    const modules: SingleModuleVersion[] = await this.moduleSelector.resolveBillOfMaterial(catalog, bom);

    const terraformComponent: TerraformComponent = await this.terraformBuilder.buildTerraformComponent(modules);

    // Output the Terraform
    terraformComponent.files.forEach(file => {
      console.log(file.name, file.contents);
    })

    // Build Zipfile
    /*
    var wait = require('wait.for');

    var items = wait.for(function (next) {
        BoxItem.find({box: req.Box}).exec(next)
    });

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=' + req.Box.id + '.zip');

    var ZipStream = require('zip-stream');
    var zip = new ZipStream();

    zip.on('error', function (err) {
        throw err;
    });

    zip.pipe(res);

    items.forEach(function (item) {

        wait.for(function (next) {

            var path = storage.getItemPath(req.Box, item);
            var source = require('fs').createReadStream(path);

            zip.entry(source, { name: item.name }, next);
        })

    });

    zip.finalize();
     */

    //https://www.archiverjs.com/zip-stream/

    // Stream Buffer back

    // Future : Push to Object Store, Git, Create a Tile Dynamically

    //const tile: Tile =  await this.tileBuilder.buildTileMetadata(terraformComponent.baseVariables, undefinedeConfig) : undefined;

    response.download("TEST", fileName);
    return response;
  }

  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    return {'status':"UP"};

  }

}
