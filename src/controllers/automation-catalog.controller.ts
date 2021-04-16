// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

/* eslint-disable @typescript-eslint/naming-convention */

import {Inject} from 'typescript-ioc';
import * as Superagent from 'superagent';

import {default as jsYaml} from 'js-yaml';

import {get, oas, param, response, Response, RestBindings,} from '@loopback/rest';

import * as _ from "lodash"

// Automation Builder
import {
  BillOfMaterial,
  BillOfMaterialModel,
  Catalog,
  CatalogLoader,
  ModuleSelector,
  OutputFile, OutputFileType,
  //OutputFileType,
  SingleModuleVersion,
  TerraformBuilder,
  buildBomVariables,
  buildBomModule,
  TerraformComponent, UrlFile,
  //UrlFile
} from '@cloudnativetoolkit/iascable';
//import {TileBuilder} from '@cloudnativetoolkit/iascable';
// FS Architectures Data Models
import {ArchitecturesRepository, ServicesRepository} from "../repositories";
import {Architectures, Bom, Services} from "../models";

import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import  AdmZip = require("adm-zip");

const catalogUrl = "https://raw.githubusercontent.com/cloud-native-toolkit/garage-terraform-modules/gh-pages/index.yaml"

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
  ) {

    console.log("Constructor for Automation Catalog")

  }

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

  @get('/automation/{id}/details')
  @response(200, {
    description: 'Get automation metadata by automation ID'
  })
  async automationById(
    @param.path.string('id') id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {

    const data:Object[] = []
    if (!this.catalog) {
      this.catalog = await this.loader.loadCatalog(catalogUrl);
    }

    this.catalog.modules.forEach(module => {
      data.push(module);
    })
    const catentry = _.find(data,{name:id});

    return catentry;
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
    if (_.isUndefined(bomid)) {
      return res.sendStatus(404);
    }

    // Read the Architecture Data
    const architecture: Architectures = await this.architecturesRepository.findById(bomid);

    if (_.isEmpty(architecture)) {
      return res.sendStatus(404);
    }

    // Read Architecture Bill of Materials
    const automationBom: Bom[] = await this.architecturesRepository.boms(bomid).find();

    if (_.isEmpty(automationBom)) {
      return res.sendStatus(404);
    }

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

    //bom.spec.modules.push("github.com/cloud-native-toolkit/terraform-ibm-container-platform");
    //bom.spec.modules.push("github.com/ibm-garage-cloud/terraform-ibm-appid")

    // Pass Architecture Varables into the Bom
    bom.spec.variables = buildBomVariables(architecture.automation_variables);

    // From the BOM build an Automation BOM
    let _errors: Array<{id:string,message:string}> = [];
    automationBom.forEach(_bom => {
      // from the bom look up service with id
      const service = _.find(serviceList, { 'service_id': _bom.service_id });
      if (!_.isUndefined(service)){
        const catentry = _.find(catids,{name:service.cloud_automation_id});
        if(!_.isUndefined(catentry) && !_.isUndefined(service.cloud_automation_id) ){

          try {
            bom.spec.modules.push(buildBomModule(this.catalog, service.cloud_automation_id, _bom.automation_variables));
          }
          catch (e) {
              // Capture Errors
              _errors.push({id:service.cloud_automation_id, message:e.message});
          }

          console.log(catentry.id);
        } else {
          console.log("Catalog entry not found "+service.cloud_automation_id);
        }
      } else {
        console.log("No Services found for "+_bom.service_id)
      }

    })

    if (!_.isEmpty(_errors)) {
      return res.status(409).send(_errors);
      return;
    }

    try {

      // Write into a Buffer
      // creating archives
      const zip = new AdmZip();

      // Lets build a BOM file from the BOM builder
      const bomContents: string = jsYaml.dump(bom);
      console.log('=====');
      console.log(bomContents);
      console.log('=====');

      const modules: SingleModuleVersion[] = await this.moduleSelector.resolveBillOfMaterial(this.catalog, bom);
      const terraformComponent: TerraformComponent = await this.terraformBuilder.buildTerraformComponent(modules);

      if (!_.isUndefined(bomContents)) {
        zip.addFile("bom.yaml", Buffer.alloc(bomContents.length,bomContents), "BOM Yaml contents");
      }

      // Add the Diagrams to the Zip Contents
      const currentPath = process.cwd();

      // Add the Diagrams from the Architectures
      zip.addLocalFile(currentPath+"/public/images/"+architecture.diagram_folder+"/"+architecture.diagram_link_png);
      zip.addLocalFile(currentPath+"/public/images/"+architecture.diagram_folder+"/"+architecture.diagram_link_drawio);

      let mdfiles = "";
      terraformComponent.files.map(async (file: OutputFile) => {
        if (file.type === "documentation") {
            mdfiles += "- ["+file.name+"]("+file.name+")\n";
        }
      });

      // Load the Core ReadME
      const readme = new UrlFile({name:'README.MD', type: OutputFileType.documentation, url: "https://raw.githubusercontent.com/ibm-gsi-ecosystem/ibm-enterprise-catalog-tiles/main/BUILD.MD"});
      const newFiles = terraformComponent.files;
      newFiles.push(readme);

      await Promise.all(newFiles.map(async (file: OutputFile) => {

        function getContents(url :string) {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
          return new Promise<string>(async (resolve) => {
            const req: Superagent.Response = await Superagent.get(url);

            resolve(req.text);
          })
        };

        let contents : string | Buffer  = "";
        console.log(file.name);
        if (file.type === "documentation") {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contents = await getContents((file as any).url);

            // Replace Variables and add
            if (file.name === "README.MD") {
              // configure details of the reference architecture
              contents = contents.replace(new RegExp("{name}", "g"), architecture.name);
              contents = contents.replace(new RegExp("{short_desc}", "g"), architecture.short_desc);
              //contents = contents.replace(new RegExp("{long_desc}", "g"), architecture.long_desc);
              contents = contents.replace(new RegExp("{diagram}", "g"), architecture.diagram_link_png);
              contents = contents.replace(new RegExp("{modules}", "g"), mdfiles);

            }

          } catch (e) {
            console.log("failed to load contents from ",file.name);
          }
        } else {
          try {
            contents = (await file.contents).toString();
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

      // Add a Markdown file that has links to the Docs
      return zip.toBuffer()

    } catch (e) {
      console.log(e);
      return res.status(409).send(e.message);
    }

  }

  @get('/catalog/{id}')
  catalogId(): object {

    // Retrieve the Catalog and convert it to JSON
    // https://raw.githubusercontent.com/ibm-garage-cloud/garage-terraform-modules/gh-pages/index.yaml

    return {'status':"UP"};

  }

}
