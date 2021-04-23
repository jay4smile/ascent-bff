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

import { mdToPdf } from 'md-to-pdf';

/* eslint-disable @typescript-eslint/naming-convention */

export class ArchitecturesBomController {
  constructor(
    @repository(ArchitecturesRepository) protected architecturesRepository: ArchitecturesRepository,
    @repository(BomRepository) protected bomRepository: BomRepository,
    @repository(ControlMappingRepository) protected cmRepository: ControlMappingRepository,
    @repository(ServicesRepository) protected servicesRepository: ServicesRepository,
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
              md += `- [${mp.control_id}](#${((mp?.control?.name && (mp.control_id + " " + mp?.control?.name)) || mp.control_id).toLowerCase().replace(/ /gi, '-').replace(/[()/]/gi, '')}) ${mp?.control?.name}\n`;
            }
            else if (mp.control_id) md += `- ${mp.control_id}\n`;
            if (mp.control_subsections) md += `  - **Control specific item(s)**: ${mp.control_subsections}\n`;
            if (mp?.goals.length) {
              md += `  - **SCC Goal(s)**:\n`;
              for (const goal of mp?.goals) {
                md += `    - **[${goal.goal_id}](https://cloud.ibm.com/security-compliance/goals/${goal.goal_id})**: ${goal.description}\n`;
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
  ): Promise<Bom> {
    return this.architecturesRepository.boms(id).create(bom);
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
