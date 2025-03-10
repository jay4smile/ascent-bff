import {
  Filter,
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  oas,
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

import  AdmZip = require("adm-zip");

import { AutomationCatalogController } from '../controllers';

import {Services} from '../appenv';

import {
  Architectures,
  Solution
} from '../models';
import {
  SolutionRepository,
  UserRepository,
  ServicesRepository,
  ArchitecturesRepository
} from '../repositories';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler, File} from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const INSTANCE_ID = process.env.INSTANCE_ID;
const BUCKET_NAME = `ascent-storage-${INSTANCE_ID}`;

interface PostBody {
  solution: Solution,
  architectures: Architectures[]
}

export class SolutionController {

  private cos : Storage.S3;
  private automationCatalogController: AutomationCatalogController;

  constructor(
    @repository(SolutionRepository)
    public solutionRepository : SolutionRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(ArchitecturesRepository)
    public architecturesRepository : ArchitecturesRepository,
    @repository(ServicesRepository)
    public servicesRepository : ServicesRepository,
    @inject(FILE_UPLOAD_SERVICE) private fileHandler: FileUploadHandler,
  ) {

    this.automationCatalogController = new AutomationCatalogController(this.architecturesRepository, this.servicesRepository, this.userRepository, this.fileHandler);

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
    } catch (error:any) {
      console.log(error)
      return res.status(400).send({error: {message: error?.code === 11000 ? `Solution ${body.solution.id} already exists.` : "Error creating solution", details: error}});
    }

    // Bind BOMs to solution
    const archsWithDetails = [];
    for (const arch of body.architectures) {
      await this.solutionRepository.architectures(newSolution.id).link(arch.arch_id);
      try {
        archsWithDetails.push(await this.architecturesRepository.findById(arch.arch_id));
      } catch (error) {
        console.log(error);
      }
    }
    // Creates default README
    const readme = `
# Ascent Solution: ${newSolution.name}

Please return to [your solution](https://ascent.cloudnativetoolkit.dev/solutions/${newSolution.id}) to make changes.

This collection of terraform automation bundles has been crafted from a set of Terraform modules created by Ecosytem Lab team part of the IBM Strategic Partnership. Please contact Matthew Perrins mjperrin@us.ibm.com, Sean Sundberg seansund@us.ibm.com, Andrew Trice amtrice@us.ibm.com or Noé Samaille noe.samaille@ibm.com for more details.

## Change Log

- **${new Date().toDateString()}** - Initial version

## Description

${newSolution.long_desc ? newSolution.long_desc : newSolution.short_desc ? newSolution.short_desc : 'Update this section to describe your solution'}

## Bill Of Materials used in this solution

| ID | Name | Description | 
| -- | ---- | ----------- |
${archsWithDetails.map(arch => `| ${arch.arch_id} | [${arch.name}](https://ascent.cloudnativetoolkit.dev/boms/${arch.arch_id}) | ${arch.short_desc} |`).join('\n')}

    `
    // Put default readme for solution
    try {
      await new Promise((resolve, reject) => {
        this.cos.putObject({
          Bucket: BUCKET_NAME,
          Key: `solutions/${newSolution.id}/README.md`,
          Body: Buffer.from(readme)
        }, (putObjErr) => {
          if (putObjErr) {
            reject({error: putObjErr})
          }
          console.log('README added')
          return resolve('ok');
        });
      });
    } catch (error) {
      console.log(error);
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
          let fileIx = 0;
          const errors:object[] = [];
          for (const file of files) {
            this.cos.putObject({
              Bucket: BUCKET_NAME,
              Key: `solutions/${id}/${file.name}`,
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
        }
      });
    });
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
    // Only get public solutions
    const publicFilter = {
      ...filter,
      where: {
        ...filter?.where,
        public: true
      }
    }
    return this.solutionRepository.find(publicFilter);
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
  ): Promise<any> {
    const solution:any = JSON.parse(JSON.stringify(await this.solutionRepository.findById(id, filter)));
    try {
      let solObjects = (await this.cos.listObjects({Bucket: BUCKET_NAME}).promise()).Contents;
      if (solObjects) {
        solObjects = solObjects.filter(obj => obj.Key?.startsWith(`solutions/${id}/`));
        for (const obj of solObjects) {
          obj.Key = obj.Key?.replace(`solutions/${id}/`, '');
        }
      }
      solution.files = solObjects;
    } catch (error) {
      console.log(error);
    }
    console.log(solution);
    return solution;
  }

  @get('/solutions/{id}/files/{filename}')
  @response(200, {
    description: 'Get solution file by name',
  })
  @oas.response.file()
  async getFile(
    @param.path.string('id') id: string,
    @param.path.string('filename') filename: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<any> {
    try {
      return (await this.cos.getObject({
        Bucket: BUCKET_NAME,
        Key: `solutions/${id}/${filename}`
      }).promise()).Body;
    } catch (error) {
      return res.status(400).send({error: {
        message: `Could not fetch file ${filename} for solution ${id}`,
        details: error
      }})
    }
  }

  @get('/solutions/{id}/files.zip')
  @response(200, {
    description: 'Get solution file by name',
  })
  @oas.response.file()
  async getFiles(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<any> {
    try {
      const zip = new AdmZip();

      // Add files from COS
      let objects = (await this.cos.listObjects({
        Bucket: BUCKET_NAME
      }).promise()).Contents;
      if (objects) {
        objects = objects.filter(file => file.Key?.startsWith(`solutions/${id}/`));
      }
      if (objects) for (const object of objects) {
        if (object.Key) {
          const cosObj = (await this.cos.getObject({
            Bucket: BUCKET_NAME,
            Key: object.Key
          }).promise()).Body;
          if (cosObj) zip.addFile(object.Key?.replace(`solutions/${id}/`, ''), new Buffer(cosObj.toString()));
        }
      }

      return zip.toBuffer();
    } catch (error) {
      return res.status(400).send({error: {
        message: `Could not fetch files for solution ${id}`,
        details: error
      }})
    }
  }

  @get('/solutions/{id}/automation')
  @response(200, {
    description: 'Download Terraform Package for solution',
  })
  @oas.response.file()
  async downloadAutomationZip(
      @param.path.string('id') id: string,
      @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {

    // Check if we have a bom ID
    if (_.isUndefined(id)) {
      return res.sendStatus(404);
    }

    // Read the Architecture Data
    const solution = await this.solutionRepository.findById(id, { include: ['architectures'] });

    if (_.isEmpty(solution)) {
      return res.sendStatus(404);
    }

    try {

      // Create zip
      const zip = new AdmZip();

      // Build automation for each ref. arch
      if (solution.architectures) for (const arch of solution.architectures) {
        console.log(`Building automation for ${arch.arch_id}`);
        // zip.addFile(`${arch.arch_id}/`, null);
        const archZipBuffer = await this.automationCatalogController.downloadAutomationZip(arch.arch_id, res);
        if (archZipBuffer instanceof Buffer) {
          const archZip = new AdmZip(archZipBuffer);
          for (const entry of archZip.getEntries()) {
            zip.addFile(`${arch.arch_id}/${entry.rawEntryName.toString()}`, entry.getData());
          }
        } else {
          return res.status(400).send({error: {message: `Error loading zip for architecture ${arch.arch_id}`}});
        }
      }

      // Add files from COS
      try {
        let objects = (await this.cos.listObjects({
          Bucket: BUCKET_NAME
        }).promise()).Contents;
        if (objects) {
          objects = objects.filter(file => file.Key?.startsWith(`solutions/${id}/`));
        }
        if (objects) for (const object of objects) {
          if (object.Key) {
            const cosObj = (await this.cos.getObject({
              Bucket: BUCKET_NAME,
              Key: object.Key
            }).promise()).Body;
            if (cosObj) zip.addFile(object.Key?.replace(`solutions/${id}/`, ''), new Buffer(cosObj.toString()));
          }
        }
      } catch (error) {
        console.log(error);
      }

      console.log(zip.getEntries().map(entry => entry.entryName));

      return zip.toBuffer();

    } catch (e:any) {
      console.log(e);
      return res.status(409).send(e?.message);
    }

  }

  @patch('/solutions/{id}')
  @response(200, {
    description: 'Solution model instance',
    content: {'application/json': {schema: getModelSchemaRef(Solution)}},
  })
  async updateById(
    @param.path.string('id') id: string,
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
    await this.solutionRepository.updateById(id, body.solution);
    if (body.architectures?.length) {
      for (const arch of await this.solutionRepository.architectures(id).find()) {
        await this.solutionRepository.architectures(id).unlink(arch.arch_id);
      }
      for (const arch of body.architectures) {
        await this.solutionRepository.architectures(id).link(arch.arch_id);
      }
    }
    return this.solutionRepository.findById(id, {include: ['architectures']});
  }

  @del('/solutions/{id}')
  @response(204, {
    description: 'Solution DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    try {
      // Delete all objects in solution bucket
      const objs = (await this.cos.listObjects({
        Bucket: BUCKET_NAME
      }).promise()).Contents?.filter(obj => obj.Key?.startsWith(`solutions/${id}/`))?.filter(obj => obj.Key);
      if (objs) await this.cos.deleteObjects({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objs.map((obj => ({ Key: obj.Key ?? '' })))
        }
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
