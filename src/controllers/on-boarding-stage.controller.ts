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
  put,
  del,
  requestBody,
  response,
  RestBindings,
  Response
} from '@loopback/rest';
import {
  OnBoardingStage,
  Controls
} from '../models';
import {
  OnBoardingStageRepository,
  ControlsRepository
} from '../repositories';

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-throw-literal */

interface stageTree {
  id: string,
  children: stageTree[]
}

export class OnBoardingStageController {
  constructor(
    @repository(OnBoardingStageRepository)
    public onBoardingStageRepository : OnBoardingStageRepository,
    @repository(ControlsRepository)
    public controlsRepository : ControlsRepository,
  ) {}
  
  validateTreeWorker(tree: stageTree, controls: Controls[]): string[] {
    const invalidIds = []
    if (controls.findIndex(control => control.id === tree.id) === -1) invalidIds.push(tree.id);
    if (tree.children) {
      for (const child of tree.children) {
        for (const invadidId of this.validateTreeWorker(child, controls)) {
          invalidIds.push(invadidId)
        }
      }
    }
    return invalidIds;
  }

  async validateTree(treeString: string): Promise<void> {
    const tree:stageTree = JSON.parse(treeString);
    const controls = await this.controlsRepository.find();
    const invalidIds = this.validateTreeWorker(tree, controls);
    if (invalidIds.length) throw `Control ID(s): ${invalidIds.join(', ')} are not valid!`;
  }

  @post('/on-boarding-stages')
  @response(200, {
    description: 'OnBoardingStage model instance',
    content: {'application/json': {schema: getModelSchemaRef(OnBoardingStage)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OnBoardingStage, {
            title: 'NewOnBoardingStage',
            exclude: ['id'],
          }),
        },
      },
    })
    onBoardingStage: Omit<OnBoardingStage, 'id'>,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<OnBoardingStage|object> {
    if (onBoardingStage.content) {
      try {
        await this.validateTree(onBoardingStage.content);
      } catch (error) {
        return res.status(400).send({error: {
          message: error
        }})
      }
    }
    return this.onBoardingStageRepository.create(onBoardingStage);
  }

  @get('/on-boarding-stages/count')
  @response(200, {
    description: 'OnBoardingStage model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(OnBoardingStage) where?: Where<OnBoardingStage>,
  ): Promise<Count> {
    return this.onBoardingStageRepository.count(where);
  }

  @get('/on-boarding-stages')
  @response(200, {
    description: 'Array of OnBoardingStage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OnBoardingStage, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(OnBoardingStage) filter?: Filter<OnBoardingStage>,
  ): Promise<OnBoardingStage[]> {
    return this.onBoardingStageRepository.find(filter);
  }

  @patch('/on-boarding-stages')
  @response(200, {
    description: 'OnBoardingStage PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OnBoardingStage, {partial: true}),
        },
      },
    })
    onBoardingStage: OnBoardingStage,
    @inject(RestBindings.Http.RESPONSE) res: Response,
    @param.where(OnBoardingStage) where?: Where<OnBoardingStage>,
  ): Promise<Count|object> {
    if (onBoardingStage.content) {
      try {
        await this.validateTree(onBoardingStage.content);
      } catch (error) {
        return res.status(400).send({error: {
          message: error
        }})
      }
    }
    return this.onBoardingStageRepository.updateAll(onBoardingStage, where);
  }

  @get('/on-boarding-stages/{id}')
  @response(200, {
    description: 'OnBoardingStage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(OnBoardingStage, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(OnBoardingStage, {exclude: 'where'}) filter?: FilterExcludingWhere<OnBoardingStage>
  ): Promise<OnBoardingStage> {
    return this.onBoardingStageRepository.findById(id, filter);
  }

  @patch('/on-boarding-stages/{id}')
  @response(204, {
    description: 'OnBoardingStage PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OnBoardingStage, {partial: true}),
        },
      },
    })
    onBoardingStage: OnBoardingStage,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<OnBoardingStage|object> {
    if (onBoardingStage.content) {
      try {
        await this.validateTree(onBoardingStage.content);
      } catch (error) {
        return res.status(400).send({error: {
          message: error
        }})
      }
    }
    await this.onBoardingStageRepository.updateById(id, onBoardingStage)
    return this.onBoardingStageRepository.findById(id);
  }

  @put('/on-boarding-stages/{id}')
  @response(204, {
    description: 'OnBoardingStage PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() onBoardingStage: OnBoardingStage,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void|object> {
    if (onBoardingStage.content) {
      try {
        await this.validateTree(onBoardingStage.content);
      } catch (error) {
        return res.status(400).send({error: {
          message: error
        }})
      }
    }
    await this.onBoardingStageRepository.replaceById(id, onBoardingStage);
  }

  @del('/on-boarding-stages/{id}')
  @response(204, {
    description: 'OnBoardingStage DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.onBoardingStageRepository.deleteById(id);
  }
}
