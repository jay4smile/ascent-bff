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
} from '@loopback/rest';
import {OnBoardingStage} from '../models';
import {OnBoardingStageRepository} from '../repositories';

export class OnBoardingStageController {
  constructor(
    @repository(OnBoardingStageRepository)
    public onBoardingStageRepository : OnBoardingStageRepository,
  ) {}

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
  ): Promise<OnBoardingStage> {
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
    @param.where(OnBoardingStage) where?: Where<OnBoardingStage>,
  ): Promise<Count> {
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
  ): Promise<OnBoardingStage> {
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
  ): Promise<void> {
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
