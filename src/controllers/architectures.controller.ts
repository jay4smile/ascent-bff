import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {inject} from "@loopback/core";
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
  RestBindings,
  Response
} from '@loopback/rest';
import {Architectures} from '../models';
import {ArchitecturesRepository} from '../repositories';

import * as _ from 'lodash';
import {Services} from '../appenv';
import * as Storage from "ibm-cos-sdk"
import assert from "assert";
import yaml from 'js-yaml';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ArchitecturesController {

  private cos : any;

  constructor(
    @repository(ArchitecturesRepository)
    public architecturesRepository : ArchitecturesRepository,
  ) {

    console.log("Constructor for Architecture API")

    // Load Information from Environment
    const services = Services.getInstance();

    // The services object is a map named by service so we extract the one for MongoDB
    const storageServices:any = services.getService('storage');

    // This check ensures there is a services for MongoDB databases
    assert(!_.isUndefined(storageServices), 'backend must be bound to storage service');

    if (_.isUndefined(storageServices)){
      console.log("Failed to load Storage sdk")
      return;
    }

    // Connect to Object Storage
    const config = {
      endpoint: storageServices.endpoints,
      apiKeyId: storageServices.apikey,
      serviceInstanceId: storageServices.resource_instance_id,
      signatureVersion: 'iam',
    };

    this.cos = new Storage.S3(config);

  }

  /*
  @get('/architectures/{id}/diagram')
  @response(200, {
    description: 'Download Terraform Package based on the reference architecture BOM',
    content: {
      'application/png': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },

    })
  @oas.response.file()
  async downloadAutomationZip(
      @param.path.string('id') id: string,
      @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {

  @get('/architectures/{id}/diagram')
  @response(200, {
    description: 'Architectures model Diagram',
    content: {
      'application/png': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },
    },
  })
  async findDiagramById(
      @param.path.string('id') id: string,
      @param.filter(Architectures, {exclude: 'where'}) filter?: FilterExcludingWhere<Architectures>
  ): Promise<Architectures> {

      console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
      return this.cos.getObject({
        Bucket: bucketName,
        Key: itemName
      }).promise()
          .then((data) => {
            if (data != null) {
              console.log('File Contents: ' + Buffer.from(data.Body).toString());
            }
          })
          .catch((e) => {
            console.error(`ERROR: ${e.code} - ${e.message}\n`);
          });
    }

    return this.architecturesRepository.findById(id, filter);

  }

 */

  @post('/architectures')
  @response(200, {
    description: 'Architectures model instance',
    content: {'application/json': {schema: getModelSchemaRef(Architectures)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {
            title: 'NewArchitectures',

          }),
        },
      },
    })
    architectures: Architectures,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Architectures> {
    return new Promise((resolve, reject) => {
      if (architectures.automation_variables) {
        try {
          yaml.load(architectures.automation_variables);
        } catch (error) {
          return reject(res.status(400).send({error: {
            message: "Wrong yaml format for automation variables",
            details: error
          }}));
        }
      }
      return resolve(this.architecturesRepository.create(architectures));
    });
  }

  @get('/architectures/count')
  @response(200, {
    description: 'Architectures model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Architectures) where?: Where<Architectures>,
  ): Promise<Count> {
    return this.architecturesRepository.count(where);
  }

  @get('/architectures')
  @response(200, {
    description: 'Array of Architectures model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Architectures, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Architectures) filter?: Filter<Architectures>,
  ): Promise<Architectures[]> {
    return this.architecturesRepository.find(filter);
  }

  @patch('/architectures')
  @response(200, {
    description: 'Architectures PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {partial: true}),
        },
      },
    })
    architectures: Architectures,
    @inject(RestBindings.Http.RESPONSE) res: Response,
    @param.where(Architectures) where?: Where<Architectures>,
  ): Promise<Count> {
    return new Promise((resolve, reject) => {
      if (architectures.automation_variables) {
        try {
          yaml.load(architectures.automation_variables);
        } catch (error) {
          return reject(res.status(400).send({error: {
            message: "Wrong yaml format for automation variables",
            details: error
          }}));
        }
      }
      return resolve(this.architecturesRepository.updateAll(architectures, where));
    });
  }

  @get('/architectures/{id}')
  @response(200, {
    description: 'Architectures model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Architectures, {exclude: 'where'}) filter?: FilterExcludingWhere<Architectures>
  ): Promise<Architectures> {
    return this.architecturesRepository.findById(id, filter);
  }

  @patch('/architectures/{id}')
  @response(200, {
    description: 'Architectures model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {partial: true}),
        },
      },
    })
    architectures: Architectures,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Architectures> {
    return new Promise((resolve, reject) => {
      if (architectures.automation_variables) {
        try {
          yaml.load(architectures.automation_variables);
        } catch (error) {
          return reject(res.status(400).send({error: {
            message: "Wrong yaml format for automation variables",
            details: error
          }}));
        }
      }
      this.architecturesRepository.updateById(id, architectures)
      .then(() => {
        return resolve(this.architecturesRepository.findById(id));
      })
      .catch((err) => {
        return reject(err);
      });
    });
  }

  @del('/architectures/{id}')
  @response(204, {
    description: 'Architectures DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.architecturesRepository.deleteById(id);
  }
}
