import {Inject} from 'typescript-ioc';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {inject} from "@loopback/core";
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
  Request,
  response,
  Response,
  oas,
  RestBindings
} from '@loopback/rest';
import {
  Architectures,
  Bom,
} from '../models';
import { ArchitecturesRepository, BomRepository, ControlMappingRepository, ServicesRepository } from '../repositories';
import { BomController } from '.';

import {
  ModuleSelector,
  CatalogLoader,
  Catalog
} from '@cloudnativetoolkit/iascable';

import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';
import yaml, { YAMLException } from 'js-yaml';

import { mdToPdf } from 'md-to-pdf';

const catalogUrl = "https://raw.githubusercontent.com/cloud-native-toolkit/garage-terraform-modules/gh-pages/index.yaml"

/* eslint-disable no-throw-literal */

interface File {
  mimetype: string,
  buffer: Buffer,
  size: number
}

const loadAndValidateBomYaml = (yamlString:string) => {
  const doc = yaml.load(yamlString);
  if (doc.kind !== "BillOfMaterial")  throw new YAMLException("YAML property 'kind' must be set to 'BillOfMaterial'.");
  if (!doc.metadata.name) throw new YAMLException("YAML property 'metadata.name' must be set.");
  if (!doc?.spec?.modules.length) throw new YAMLException("YAML property 'spec.modules' must be a list of valid terraform modules.");
  return doc;
}

/* eslint-disable @typescript-eslint/naming-convention */

export class ArchitecturesBomController {

  @Inject
  moduleSelector!: ModuleSelector;
  @Inject
  loader!: CatalogLoader;
  catalog: Catalog;

  constructor(
    @repository(ArchitecturesRepository) protected architecturesRepository: ArchitecturesRepository,
    @repository(BomRepository) protected bomRepository: BomRepository,
    @repository(ControlMappingRepository) protected cmRepository: ControlMappingRepository,
    @repository(ServicesRepository) protected servicesRepository: ServicesRepository,
    @inject(FILE_UPLOAD_SERVICE) private fileHandler: FileUploadHandler
  ) { }

  @get('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Array of Architectures has many Bom',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Bom)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Bom>,
  ): Promise<Bom[]> {
    return this.architecturesRepository.boms(id).find(filter);
  }

  @get('/architectures/{archid}/compliance-report.pdf')
  @response(200, {
    description: 'Download PDF compliance report based on the reference architecture BOM',
  })
  @oas.response.file()
  async downloadComplianceReport(
    @param.path.string('archid') archId: string,
    @param.query.string('profile') profileId: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    // Get data
    const arch = await this.architecturesRepository.findById(archId);
    const archBom = await new BomController(this.bomRepository, this.servicesRepository, this.architecturesRepository, this.cmRepository).compositeCatalogByArchId(archId);
    const services = [...new Set(archBom.map(bom => bom.service))];
    const serviceIds = [...new Set(archBom.map(bom => bom.service_id))];
    const mappings = await this.cmRepository.find({
      "where": {
        "service_id": {
          "inq": serviceIds
        },
        "scc_profile": profileId
      },
      "include": [
        "profile",
        "goals",
        "control"
      ]
    });
    const controls = [...new Set(mappings.map(mapping => mapping.control))];

    // Build Markdown
    let md = `# ${arch.name}\n`;
    if (arch.diagram_link_png && arch.diagram_folder) {
      const diagramPath = `./public/images/${arch.diagram_folder}/${arch.diagram_link_png}`;
      // Add the Diagrams from the Architectures
      md += `\n## Reference Architecture Diagram\n`;
      md += `![Reference Architecture Diagram PNG](${diagramPath})\n`;
    }
    md += `\n## Bill of Materials\n`;
    for await (const p of archBom) {
      md += `- ${p.desc}: [${p.service.ibm_catalog_service ?? p.service.service_id}](#${(p.service.ibm_catalog_service ?? p.service.service_id).toLowerCase().replace(/ /gi, '-')})\n`;
    }
    md += `\n# Services\n`;
    for await (const service of services) {
      if (service) {
        const catalog = archBom.find(elt => elt.service.service_id === service.service_id)?.catalog;
        md += `\n## ${service.ibm_catalog_service ?? service.service_id}\n`;
        md += `\n### Description\n`;
        md += `${catalog?.overview_ui?.en?.long_description ?? catalog?.overview_ui?.en?.description ?? service.desc}\n`;
        if (catalog?.provider?.name) md += `- **Provider**: ${catalog?.provider?.name}\n`;
        if (service.grouping) md += `- **Group**: *${service.grouping}*\n`;
        if (service.deployment_method) md += `- **Deployment Method**: *${service.deployment_method}*\n`;
        if (service.provision) md += `- **Provision**: *${service.provision}*\n`;
        if (catalog?.geo_tags?.length) {
          md += `- **Geos**:\n`;
          for (const tag of catalog.geo_tags) md += `  - *${tag}*\n`;
        }
        const serviceMappings = mappings.filter(elt => elt.service_id === service.service_id);
        if (serviceMappings.length) {
          md += `\n### Impacting controls\n`;
          for (const mp of serviceMappings) {
            if (mp.control_id && mp?.control?.id) {
              md += `- **[${mp.control_id}](#${((mp?.control?.name && (mp.control_id + " " + mp?.control?.name)) || mp.control_id).toLowerCase().replace(/ /gi, '-').replace(/[()/]/gi, '')})**: ${mp?.control?.name}\n`;
            }
            else if (mp.control_id) md += `- ${mp.control_id}\n`;
            if (mp.control_subsections) md += `  - **Control specific item(s)**: ${mp.control_subsections}\n`;
            if (mp?.goals.length) {
              md += `  - **Goal(s)** from [IBM Security and Compliance](https://cloud.ibm.com/security-compliance/overview):\n`;
              for (const goal of mp?.goals) {
                md += `    - [${goal.goal_id}](https://cloud.ibm.com/security-compliance/goals/${goal.goal_id}): ${goal.description}\n`;
              }
            }
          }
        }
      }
    }
    md += `\n# Controls\n`;
    for await (const control of controls) {
      if (control) {
        md += `\n## ${(control.name && (control.id + " " + control.name)) || control.id}\n`;
        md += `\n### Description\n`;
        md += `${control.description}\n`;
        if (control.parent_control) md += `**Parent control**: ${control.parent_control}\n`;
        md += `\n### Parameters\n`;
        md += `${control.parameters}\n`;
        md += `\n### Solution and Implementation\n`;
        md += `${control.implementation}\n`;
      }
    }
    const pdf = await mdToPdf({ content: md }).catch(console.error);
    if (pdf) {
      return pdf.content;
    } else {
      return res.status(500).send({error: {message: "Error generating your PDF report."}})
    }
  }

  @post('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures model instance',
        content: {'application/json': {schema: getModelSchemaRef(Bom)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Architectures.prototype.arch_id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {
            title: 'NewBomInArchitectures',
            exclude: ['_id'],
            optional: ['arch_id']
          }),
        },
      },
    }) bom: Omit<Bom, '_id'>,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Bom|Response> {
    if (bom.automation_variables) {
      if (!this.catalog) {
        this.catalog = await this.loader.loadCatalog(catalogUrl);
      }
      // Validate automation_variables yaml
      const service = await this.servicesRepository.findById(bom.service_id);
      try {
        if(!service.cloud_automation_id) throw { message: `Service ${service.ibm_catalog_service} is missing automation ID .` };
        await this.moduleSelector.validateBillOfMaterialModuleConfigYaml(this.catalog, service.cloud_automation_id, bom.automation_variables);
      } catch (error) {
        console.log(error);
        return res.status(400).send({error: {
          message: `YAML automation variables config error.`,
          details: error
        }});
      }
    }
    return this.architecturesRepository.boms(id).create(bom);
  }

  @post('/architectures/boms/import', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Information about the import status',
      },
    },
  })
  async uploadBomYaml(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
    @param.query.string('overwrite') overwrite: string
  ): Promise<object> {
    // Load Catalog
    if (!this.catalog) {
      this.catalog = await this.loader.loadCatalog(catalogUrl);
    }
    return new Promise<object>((resolve, reject) => {
      this.fileHandler(request, res,(err: unknown) => {
        let successCount = 0;
        (async () => {
          if (err) {
            throw err;
          } else {

            const uploadedFiles = request.files;
            const mapper = (f: globalThis.Express.Multer.File) => ({
              mimetype: f.mimetype,
              buffer: f.buffer,
              size: f.size
            });
            let files: File[] = [];
            if (Array.isArray(uploadedFiles)) {
              files = uploadedFiles.map(mapper);
            } else {
              for (const filename in uploadedFiles) {
                files.push(...uploadedFiles[filename].map(mapper));
              }
            }
            // Check uploaded files
            for (const file of files) {
              if (file.mimetype !== "application/x-yaml") throw {message: "You must only upload YAML files."};
              if (file.size > 102400) throw {message: "Files must me <= 100Ko."};
            }
            for (const file of files) {
              const doc = loadAndValidateBomYaml(file.buffer.toString());
              // Try to get corresponding architecture
              let arch: Architectures;
              let archExists = false;
              try {
                arch = await this.architecturesRepository.findById(doc.metadata.name);
                archExists = true;
              } catch (getArchError) {
                // Arch does not exist, create new
                arch = await this.architecturesRepository.create(new Architectures({
                  arch_id: doc.metadata.name,
                  name: doc.metadata.name,
                  short_desc: `${doc.metadata.name} Architecture.`,
                  long_desc: `${doc.metadata.name} FS Architecture.`,
                  diagram_folder: "placeholder",
                  diagram_link_drawio: "none",
                  diagram_link_png: "placeholder.png",
                  confidential: true
                }));
              }
              // Do not delete the architecture document accept it and love it and just update the variable
              //if (archExists && !overwrite) throw { message: `Architecture ${doc.metadata.name} already exists. Set 'overwrite' parameter to overwrite.` };
              // Delete existing BOMs
              //await this.architecturesRepository.boms(arch.arch_id).delete();
              // Set architecture automation variables

              await this.architecturesRepository.updateById(arch.arch_id, {
                automation_variables: yaml.dump({variables: doc.spec.variables})
              })
              // Import automation modules
              for (const module of doc.spec.modules) {
                // Validate module
                try {
                  await this.moduleSelector.validateBillOfMaterialModuleConfigYaml(this.catalog, module.name, yaml.dump(module));
                } catch (error) {
                  throw {
                    message: `YAML module config error for module ${module.name}`,
                    details: error
                  }
                }
                const services = await this.servicesRepository.find({ where: { cloud_automation_id: module.name } });
                if (!services.length) throw {message: `No service matching automation ID ${module.name}`};
                const newBom = new Bom({
                  arch_id: arch.arch_id,
                  service_id: services[0].service_id,
                  desc: module.alias || module.name
                });
                if (module.alias && module.variables) {
                  newBom.automation_variables = yaml.dump({alias: module.alias, variables: module.variables});
                } else if (module.alias) {
                  newBom.automation_variables = yaml.dump({alias: module.alias});
                } else if (module.variables) {
                  newBom.automation_variables = yaml.dump({variables: module.variables});
                }
                await this.architecturesRepository.boms(arch.arch_id).create(newBom);
              }
              successCount += 1;
            }
          }
        })()
        .then(() => resolve(res.status(200).send({ count: successCount })))
        .catch((error) => {
          reject(res.status(400).send({error: error}))
        });
      });
    });
  }

  @patch('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures.Bom PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {partial: true}),
        },
      },
    })
    bom: Partial<Bom>,
    @param.query.object('where', getWhereSchemaFor(Bom)) where?: Where<Bom>,
  ): Promise<Count> {
    return this.architecturesRepository.boms(id).patch(bom, where);
  }

  @del('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures.Bom DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Bom)) where?: Where<Bom>,
  ): Promise<Count> {
    return this.architecturesRepository.boms(id).delete(where);
  }
}
