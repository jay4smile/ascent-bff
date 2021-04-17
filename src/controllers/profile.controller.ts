import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {inject} from '@loopback/core';
import {
  param,
  get,
  post,
  getModelSchemaRef,
  Request,
  requestBody,
  response,
  Response,
  RestBindings
} from '@loopback/rest';
import parse from 'csv-parse';
import {Profile} from '../models';
import {ProfileRepository} from '../repositories';

import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';

interface File {
  mimetype: string,
  buffer: Buffer,
  size: number
} 
  
export class ProfileController {
  constructor(
    @repository(ProfileRepository)
    public profileRepository : ProfileRepository,
    @inject(FILE_UPLOAD_SERVICE) private fileHandler: FileUploadHandler,
  ) {}

  @get('/mapping/profiles/count')
  @response(200, {
    description: 'Profile model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Profile) where?: Where<Profile>,
  ): Promise<Count> {
    return this.profileRepository.count(where);
  }

  @get('/mapping/profiles')
  @response(200, {
    description: 'Array of Profile model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Profile, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Profile) filter?: Filter<Profile>,
  ): Promise<Profile[]> {
    return this.profileRepository.find(filter);
  }

  @post('/mapping/profiles', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.fileHandler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
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
          let error = {message: ""};
          if (files.length !== 1) error.message += "You must only upload 1 file. ";
          if (files.length === 1 && files[0].mimetype !== "text/csv") error.message += "File format must be CSV. ";
          if (files.length === 1 && files[0].size > 102400) error.message += "File too large (must me <= 100Ko) ";
          let csv = files[0].buffer.toString().split('"##METAINFO ENDS##"\n')
          if (csv.length !== 2) error.message += "Wrong file fromat, you must import a profile from IBM Security and Compliance Center. ";
          if (error.message) return resolve(response.status(400).send(error))
          console.log(csv[0]);
          parse(csv[1], {columns: true}, (err, records, info) => {
            console.log(err);
            console.log(records);
            console.log(info);
          });
          return resolve({files, fields: request.body});
        }
      });
    });
  }

  @get('/mapping/profiles/{id}')
  @response(200, {
    description: 'Profile model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Profile, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Profile, {exclude: 'where'}) filter?: FilterExcludingWhere<Profile>
  ): Promise<Profile> {
    return this.profileRepository.findById(id, filter);
  }

}
  