// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

/* eslint-disable @typescript-eslint/naming-convention */

import {Inject} from 'typescript-ioc';
import * as Superagent from 'superagent';

import {get, oas, param, response, Response, RestBindings,} from '@loopback/rest';

import * as _ from "lodash"

// Automation Builder
import {
  BillOfMaterial,
  BillOfMaterialModel,
  Catalog,
  CatalogLoader,
  ModuleSelector,
  OutputFile,
  //OutputFileType,
  SingleModuleVersion,
  TerraformBuilder,
  TerraformComponent,
  //UrlFile
} from '@cloudnativetoolkit/iascable';
//import {TileBuilder} from '@cloudnativetoolkit/iascable';
// FS Architectures Data Models
import {ArchitecturesRepository, ServicesRepository} from "../repositories";
import {Bom, Services} from "../models";

import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import  AdmZip = require("adm-zip");

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
      @repository(ServicesRepository)
      public serviceRepository: ServicesRepository
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

  @get('/automation/ids')
  @response(200, {
    description: 'Get a List of Catalog IDs'
  })
  async getCatalogIDs(): Promise<object> {

    if (!this.catalog) {
      this.catalog = await this.loader.loadCatalog(catalogUrl);
    }
    const data:Object[] = []
    this.catalog.modules.forEach(module => {
      data.push({name:module.name,id:module.id});
    })

    return {data};
  }

  @get('/automation/{bomid}')
  @response(200, {
    description: 'Download Terraform Package based on the reference architecture BOM',
  })
  @oas.response.file()
  async downloadAutomationZip(
      @param.path.string('bomid') bomid: string,
      @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {

    // Check if we have a bom ID
    if (_.isUndefined(bomid)){
      return res.sendStatus( 404);
    }

    // Read Architecture Bill of Materials
    const automationBom:Bom[] = await this.architecturesRepository.boms(bomid).find();

    // Retrieve the Services
    const serviceList: Services[] = await this.serviceRepository.find();

    // Load Catalog
    if (!this.catalog) {
      this.catalog = await this.loader.loadCatalog(catalogUrl);
    }

    // Get the smaller Catalog data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catids:any[] = []
    this.catalog.modules.forEach(module => {
      catids.push({name:module.name,id:module.id});
    })

    // Future : Push to Object Store, Git, Create a Tile Dynamically
    const bom: BillOfMaterialModel = new BillOfMaterial("fscloud");

    bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-ibm-container-platform");
    //bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-ibm-appid")

    // From the BOM build an Automation BOM
    automationBom.forEach(_bom => {
      // from the bom look up service with id
      const service = _.find(serviceList, { 'service_id': _bom.service_id });
      if (!_.isUndefined(service)){
        const catentry = _.find(catids,{name:service.cloud_automation_id});
        if(!_.isUndefined(catentry)){
          bom.spec.modules.push(catentry.id);
          console.log(catentry.id);
        } else {
          console.log("Catalog entry not found "+service.cloud_automation_id);
        }
      } else {
        console.log("No Services found for "+_bom.service_id)
      }

    })

    //const filter: {platform?: string; provider?: string} =  {}; // SS explain ?
    //const billOfMaterial: BillOfMaterialModel =  await this.moduleSelector.buildBillOfMaterial(catalog, bom, filter) ;
    //if (!billOfMaterial) {
    //  throw new Error('Bill of Material is required');
    //}

    try {

      const modules: SingleModuleVersion[] = await this.moduleSelector.resolveBillOfMaterial(this.catalog, bom);
      const terraformComponent: TerraformComponent = await this.terraformBuilder.buildTerraformComponent(modules);

      // Write into a Buffer
      // creating archives
      const zip = new AdmZip();

      // Load the Core ReadME
      //const readme = new UrlFile({name:'README.MD', type: OutputFileType.documentation, url: "https://raw.githubusercontent.com/ibm-gsi-ecosystem/ibm-enterprise-catalog-tiles/main/BUILD.MD"});
      //terraformComponent.files.push(readme);

      await Promise.all(terraformComponent.files.map(async (file: OutputFile) => {

        function getContents(url :string) {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
          return new Promise<string>(async (resolve) => {
            const req: Superagent.Response = await Superagent.get(url);

            resolve(req.text);
          })
        };

        let contents = "";
        console.log(file.name);
        if (file.type === "documentation") {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contents = await getContents((file as any).url);
          } catch (e) {
            console.log("failed to load contents from ",file.name);
          }
        } else {
          try {
            contents = await file.contents
          } catch (e) {
            console.log("failed to load contents from ",file.name);
          }
        }
        console.log(file.name);

        // Load Contents into the Zip
        if (contents !== "") {
          zip.addFile(file.name, Buffer.alloc(contents.length, contents), "entry comment goes here");
        }

      }));

      return zip.toBuffer()

    } catch (e) {
      return res.status(500);
    }

  }

  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    return {'status':"UP"};

  }

}
