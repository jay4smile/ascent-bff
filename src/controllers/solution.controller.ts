import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  RestBindings,
  Request,
  Response
} from '@loopback/rest';
import {inject} from "@loopback/core";

import * as _ from 'lodash';
import assert from "assert";
import * as Storage from "ibm-cos-sdk"
import util from 'util';

import {Services} from '../appenv';

import {Architectures, Solution} from '../models';
import {SolutionRepository, UserRepository} from '../repositories';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler, File} from '../types';
import { ListObjectsOutput } from 'ibm-cos-sdk/clients/s3';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PostBody {
  solution: Solution,
  architectures: Architectures[]
}

export class SolutionController {

  private cos : Storage.S3;

  constructor(
    @repository(SolutionRepository)
    public solutionRepository : SolutionRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject(FILE_UPLOAD_SERVICE) private fileHandler: FileUploadHandler,
  ) {
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

  @post('/solutions')
  @response(200, {
    description: 'Solution model instance',
    content: {'application/json': {schema: getModelSchemaRef(Solution)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            solution: getModelSchemaRef(Solution),
            architectures: getModelSchemaRef(Architectures)
          },
        },
      },
    })
    body: PostBody,
    @inject(RestBindings.Http.REQUEST) req: any,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Solution|object> {
    const user:any = req?.user;
    const email:string = user?.email;
    let newSolution:Solution;
    try {
      if (email) newSolution = await this.userRepository.solutions(email).create(body.solution);
      else newSolution = await this.solutionRepository.create(body.solution);
    } catch (error) {
      console.log(error)
      return res.status(400).send({error: {message: error?.code === 11000 ? `Solution ${body.solution.id} already exists.` : "Error creating solution", details: error}});
    }
    for (const arch of body.architectures) {
      await this.solutionRepository.architectures(newSolution.id).link(arch.arch_id);
    }
    return this.solutionRepository.findById(newSolution.id, {include: ['architectures']});
  }

  @post('/solutions/{id}/files')
  @response(204, {
    description: 'Files upload success',
  })
  async uploadFiles(
    @param.path.string('id') id: string,
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void> {
    await this.solutionRepository.findById(id, {include: ['owners']});
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
          // Create Buckett and upload files to COS
          this.cos.createBucket({
            Bucket: id,
            CreateBucketConfiguration: {
              LocationConstraint: 'eu-geo'
            }
          }).promise()
            .then(() => {
              console.log(`Bucket ${id} created.`);
            })
            .catch(function(createBucketErr) {
              console.error(util.inspect(createBucketErr));
            })
            .finally(() => {
              let fileIx = 0;
              const errors:object[] = [];
              for (const file of files) {
                this.cos.putObject({
                  Bucket: id,
                  Key: `${file.name}`,
                  Body: file.buffer
                }, (putObjErr) => {
                  if (err) {
                    errors.push(putObjErr);
                  }
                  if (++fileIx === files.length) {
                    if (err) return reject({error: errors});
                    return resolve();
                  }
                });
              }
            })
        }
      });
    });
  }

  @get('/solutions/count')
  @response(200, {
    description: 'Solution model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Solution) where?: Where<Solution>,
  ): Promise<Count> {
    return this.solutionRepository.count(where);
  }

  @get('/solutions')
  @response(200, {
    description: 'Array of Solution model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Solution, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Solution) filter?: Filter<Solution>,
  ): Promise<Solution[]> {
    return this.solutionRepository.find(filter);
  }

  @patch('/solutions')
  @response(200, {
    description: 'Solution PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Solution, {partial: true}),
        },
      },
    })
    solution: Solution,
    @param.where(Solution) where?: Where<Solution>,
  ): Promise<Count> {
    return this.solutionRepository.updateAll(solution, where);
  }

  @get('/solutions/{id}')
  @response(200, {
    description: 'Solution model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Solution, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Solution, {exclude: 'where'}) filter?: FilterExcludingWhere<Solution>
  ): Promise<Solution> {
    return this.solutionRepository.findById(id, filter);
  }

  @patch('/solutions/{id}')
  @response(200, {
    description: 'Solution PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Solution, {partial: true}),
        },
      },
    })
    solution: Solution,
  ): Promise<Solution> {
    await this.solutionRepository.updateById(id, solution);
    return this.solutionRepository.findById(id);
  }

  @put('/solutions/{id}')
  @response(204, {
    description: 'Solution PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() solution: Solution,
  ): Promise<void> {
    await this.solutionRepository.replaceById(id, solution);
  }

  @del('/solutions/{id}')
  @response(204, {
    description: 'Solution DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    try {
      // Delete all objects in solution bucket
      const objs = (await this.cos.listObjects({Bucket: id}).promise()).Contents?.filter(obj => obj.Key);
      if (objs) await this.cos.deleteObjects({Bucket: id, Delete: { Objects: objs.map((obj => ({ Key: obj.Key || '' }))) }}).promise();
      await this.cos.deleteBucket({
        Bucket: id
      }).promise();
    } catch (error) {
      console.log(error);
    }
    // console.log(res.$response.data);
    for (const arch of await this.solutionRepository.architectures(id).find()) {
      await this.solutionRepository.architectures(id).unlink(arch.arch_id);
    }
    await this.solutionRepository.deleteById(id);
  }
}
