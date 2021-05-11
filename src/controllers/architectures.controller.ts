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
  oas,
  Request,
  requestBody,
  response,
  RestBindings,
  Response
} from '@loopback/rest';
import {Architectures} from '../models';
import {ArchitecturesRepository} from '../repositories';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler, File} from '../types';

import * as _ from 'lodash';
import {Services} from '../appenv';
import * as Storage from "ibm-cos-sdk"
import assert from "assert";
import yaml from 'js-yaml';

import util from 'util';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */


export enum DiagramType {
  DRAWIO = "drawio",
  PNG ="png"
}

export class ArchitecturesController {

  private cos : Storage.S3;
  private bucketNames: {
    drawio: Storage.S3.BucketName,
    png: Storage.S3.BucketName
  };

  constructor(
    @repository(ArchitecturesRepository)
    public architecturesRepository : ArchitecturesRepository,
    @inject(FILE_UPLOAD_SERVICE) private fileHandler: FileUploadHandler
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
    this.bucketNames = {
      drawio: "architecture-diagrams-drawio",
      png: "architecture-diagrams-images"
    }
    this.cos.listBuckets().promise()
      .then(data => {
        if (!data?.Buckets?.find(bucket => bucket.Name === this.bucketNames.drawio)) {
          this.cos.createBucket({
            Bucket: this.bucketNames.drawio,
            CreateBucketConfiguration: {
              LocationConstraint: 'eu-geo'
            }
          }).promise()
            .then(() => {
              console.log(`Bucket ${this.bucketNames.drawio} created.`);
            })
            .catch(function(err) {
              console.error(util.inspect(err));
            });
        }
        if (!data?.Buckets?.find(bucket => bucket.Name === this.bucketNames.png)) {
          this.cos.createBucket({
            Bucket: this.bucketNames.png,
            CreateBucketConfiguration: {
              LocationConstraint: 'eu-geo'
            }
          }).promise()
            .then(() => {
              console.log(`Bucket ${this.bucketNames.png} created.`);
            })
            .catch(function(err) {
              console.error(util.inspect(err));
            });
        }
      })
      .catch(function(err) {
        console.error(util.inspect(err));
      });
  }

  public async getDiagram(arch_id: string, diagramType: DiagramType): Promise<Storage.S3.Body> {
    return new Promise((resolve, reject) => {
      this.cos.getObject({
        Bucket: this.bucketNames[diagramType],
        Key: `${arch_id}-diagram.${diagramType}`
      }).promise()
        .then((data) => {
          if (data?.Body) {
            return resolve(data.Body);
          }
          return reject({error: {
            message: `Error retrieving diagram`,
            details: data
          }});
        }, (error) => {
          if (error?.code === "NoSuchKey") {
            return this.cos.getObject({
              Bucket: this.bucketNames[diagramType],
              Key: `placeholder.${diagramType}`
            }).promise()
              .then((data) => {
                if (data?.Body) {
                  return resolve(data.Body);
                }
                return reject({error: {
                  message: `Error retrieving diagram`,
                  details: data
                }});
              }, (e) => {
                return reject({error: {
                  message: `Error retrieving diagram`,
                  details: e
                }});
              })
              .catch((e) => reject({error: {
                message: `Error retrieving diagram`,
                details: e
              }}));
          }
          return reject({error: {
            message: `Error retrieving diagram`,
            details: error
          }});
        })
        .catch((e) => {
          return reject({error: {
          message: `Error retrieving diagram`,
          details: e
          }});
      });
    });
  }

  @get('/architectures/{id}/diagram/{type}')
  @response(200, {
    description: 'Get architecture diagram (.drawio or .png)',
  })
  @oas.response.file()
  async findDiagramById(
    @param.path.string('id') arch_id: string,
    @param.path.string('type') fileType: DiagramType,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<any> {
    if (fileType !== DiagramType.DRAWIO && fileType !== DiagramType.PNG) {
      return res.status(400).send({error: {
        message: `Diagram type must be either "drawio" or "png"`
      }});
    }
    const arch = await this.architecturesRepository.findById(arch_id);
    return new Promise((resolve, reject) => {
      this.getDiagram(arch.arch_id, fileType)
          .then((data) => {
            return resolve(data);
          }, (error => {
            return reject(res.status(400).send(error));
          }))
          .catch(getErr => {
            return reject(res.status(400).send({error: {
              message: `Error retrieving diagram`,
              details: getErr
            }}));
          });
    });
  }

  private async putDiagrams(files: File[], arch_id: string): Promise<object> {
    return new Promise((resolve, reject) => {
      const error = {message: ""};
      console.log(files);
      if (files.length < 1 || files.length > 2) error.message += "You must upload 1 or 2 files. ";
      if (files.find((f) => (f.fieldname !== "drawio" && f.fieldname !== "png"))) error.message += "Only .drawio and .png files are accepted. ";
      if (files.find((f) => f.size > 2000 * 1024)) error.message += "File too large (must me <= 2MiB) ";
      if (error.message) return reject({error: error});
      console.log(files[0]);
      this.cos.putObject({
        Bucket: files[0].fieldname === "drawio" ? this.bucketNames.drawio : this.bucketNames.png,
        Key: `${arch_id}-diagram.${files[0].fieldname}`,
        Body: files[0].buffer
      }, (err) => {
        if (err) {
          return reject({error: err});
        }
        if (files.length === 2) {
          this.cos.putObject({
            Bucket: files[1].fieldname === "drawio" ? this.bucketNames.drawio : this.bucketNames.png,
            Key: `${arch_id}-diagram.${files[1].fieldname}`,
            Body: files[1].buffer
          }, (secErr) => {
            if (secErr) {
              return reject({error: secErr});
            }
            return resolve({});
          });
        } else return resolve({});
      });
    });
  }

  @post('/architectures/{id}/diagram')
  @response(204, {
    description: 'Diagram import success',
  })
  async postDiagram(
    @requestBody.file()
    request: Request,
    @param.path.string('id') arch_id: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void> {
    const arch = await this.architecturesRepository.findById(arch_id);
    return new Promise((resolve, reject) => {
      this.fileHandler(request, res, (err: unknown) => {
        if (err) reject({error: err});
        else {
          const uploadedFiles = request.files;
          const mapper = (f: globalThis.Express.Multer.File) => ({
            mimetype: f.mimetype,
            buffer: f.buffer,
            size: f.size,
            fieldname: f.fieldname,
            name: f.originalname
          });
          let files: File[] = [];
          if (Array.isArray(uploadedFiles)) {
            files = uploadedFiles.map(mapper);
          } else {
            for (const filename in uploadedFiles) {
              files.push(...uploadedFiles[filename].map(mapper));
            }
          }
          this.putDiagrams(files, arch.arch_id)
          .then((putErr) => {
            if (putErr) return reject(res.status(400).send(putErr));
            return resolve();
          })
          .catch(putErr => {
            return reject(res.status(400).send(putErr));
          });
        }
      });
    });
  }
  
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
