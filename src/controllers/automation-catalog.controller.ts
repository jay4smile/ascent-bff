// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {Inject} from 'typescript-ioc';

import {
  del,
  get, getModelSchemaRef,
  oas,
  param, response,
  Response,
  RestBindings,
} from '@loopback/rest';

import * as _ from "lodash"
import  AdmZip = require("adm-zip");

// Automation Builder
import {BillOfMaterial, BillOfMaterialModel} from '@cloudnativetoolkit/iascable';
import {SingleModuleVersion, TerraformComponent} from '@cloudnativetoolkit/iascable';
import {Catalog, CatalogLoader} from '@cloudnativetoolkit/iascable';

import {ModuleSelector} from '@cloudnativetoolkit/iascable';
import {TerraformBuilder} from '@cloudnativetoolkit/iascable';
//import {TileBuilder} from '@cloudnativetoolkit/iascable';

// FS Architectures Data Models
import {BomRepository, ArchitecturesRepository} from "../repositories";
import {Bom} from "../models";

import {inject} from "@loopback/core";
import {Filter, HasManyRepository, repository} from "@loopback/repository";
import {Controls} from "../models";

const catalogUrl = "https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml"

export class AutomationCatalogController  {

  @Inject
  loader!: CatalogLoader;
  @Inject
  moduleSelector!: ModuleSelector;
  @Inject
  terraformBuilder!: TerraformBuilder;

  catalog: Catalog;

  constructor(
      @repository(ArchitecturesRepository)
      public architecturesRepository : ArchitecturesRepository,
  ) {}

//  @Inject
//  tileBuilder!: TileBuilder;

  @get('/automation/catalog')
  async catalogLoader(): Promise<object> {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    // Load the Catalog using the Catalog Class
    const catalog: Catalog = await this.loader.loadCatalog(catalogUrl);
    return {catalog};

  }

  @get('/automation/{bomid}')
  @response(200, {
    description: 'Download Terraform Package based on the reference architecture BOM',
  })
  @oas.response.file()
  async downloadAutomationZip(
      @param.path.string('bomid') bomid: string,
      @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {

    // Check if we have a bom ID
    if (_.isUndefined(bomid)){
      return response.sendStatus( 404);
    }

    // Read Architecture Bill of Materials
    let automationBom:HasManyRepository<Bom> = await this.architecturesRepository.boms(bomid);

    // Load Service Map to the Bill Materials

    // Load Catalog
    if (!this.catalog) {
      this.catalog = await this.loader.loadCatalog(catalogUrl);
    }

    // Future : Push to Object Store, Git, Create a Tile Dynamically
    const bom: BillOfMaterialModel = new BillOfMaterial("fscloud");

    bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-k8s-ocp-cluster");
    bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-ibm-cp-app-connect")

    //const filter: {platform?: string; provider?: string} =  {}; // SS explain ?

    //const billOfMaterial: BillOfMaterialModel =  await this.moduleSelector.buildBillOfMaterial(catalog, bom, filter) ;

    //if (!billOfMaterial) {
    //  throw new Error('Bill of Material is required');
    //}

    const modules: SingleModuleVersion[] = await this.moduleSelector.resolveBillOfMaterial(this.catalog, bom);
    const terraformComponent: TerraformComponent = await this.terraformBuilder.buildTerraformComponent(modules);

    // Write into a Buffer
    // creating archives
    var zip = new AdmZip();

    // Output the Terraform
    terraformComponent.files.forEach(file => {
      console.log(file.name, file.contents);
      zip.addFile(file.name, Buffer.alloc(file.contents.length, file.contents), "entry comment goes here");

    })

    console.log(JSON.stringify(zip.getEntries()));

    return zip.toBuffer()
  }

  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    return {'status':"UP"};

  }

}
